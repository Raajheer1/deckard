import {supabase} from "../client";
import {AuthError, PostgrestError, User} from "@supabase/supabase-js";
import {Preference, PreferenceReq} from "../../types";

export async function GetUser(): Promise<User | null> {
    const {data, error} = await supabase.auth.getUser();
    if (error !== null) {
        return null;
    }

    return data.user;
}

export async function SignIn(email: string, password: string): Promise<{ data: User | null, error: AuthError | null }> {
    const {data, error} =
        await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

    if (error !== null) {
        return {data: data.user, error};
    }

    return {data: null, error};
}

export async function SignOut() {
    return await supabase.auth.signOut();
}

export async function SignUp(
    displayName: string,
    email: string,
    password: string
): Promise<{ data: User | null, error: AuthError | null }> {
    const {data, error} = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                display_name: displayName,
            },
        },
    });

    if (error !== null) {
        await SignIn(email, password);
        return {data: data.user, error};
    }

    return {data: null, error};
}

export async function SetPreferences(preferences: PreferenceReq[]): Promise<any> {
    let prefs: string[] = [];
    preferences.forEach((pref) => {
        prefs.push(pref.preference);
    });
    const {error} = await supabase.functions.invoke('add-preferences', {
        body: {preferences: prefs}
    })

    if (error !== null) {
        return error;
    }

    return null;
}

export async function RemovePreference(preference: Preference): Promise<PostgrestError | null> {
    const {error} = await supabase.from('preferences').delete().eq('id', preference.id);
    return error
}