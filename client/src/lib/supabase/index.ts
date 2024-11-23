import { supabase } from "../client";
import {
  AuthError,
  PostgrestError,
  User,
} from "@supabase/supabase-js";
import { PaperCard, Preference } from "../../types";

export async function GetUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error !== null) {
    return null;
  }

  return data.user;
}

export async function SignIn(
  email: string,
  password: string
): Promise<{ data: User | null; error: AuthError | null }> {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

  if (error !== null) {
    return { data: data.user, error };
  }

  return { data: null, error };
}

export async function SignOut() {
  return await supabase.auth.signOut();
}

export async function SignUp(
  displayName: string,
  email: string,
  password: string
): Promise<{ data: User | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signUp({
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
    return { data: data.user, error };
  }

  return { data: null, error };
}

export async function SetPreferences(
  preferences: string[]
): Promise<{ error: any | null }> {
  const prefsAppended = preferences.map((p) => `${p} research`);
  const { error } = await supabase.functions.invoke(
    "add-preferences",
    {
      body: { preferences: prefsAppended },
    }
  );

  if (error !== null) {
    return error;
  }

  return { error: null };
}

export async function RemovePreference(
  preference: Preference
): Promise<PostgrestError | null> {
  const { error } = await supabase
    .from("preferences")
    .delete()
    .eq("id", preference.id);
  return error;
}

export async function GetPreferences(
  userId: string
): Promise<{ data: Preference[]; error: any }> {
  const { data, error } = await supabase
    .from("preferences")
    .select()
    .eq("user_id", userId);

  console.log(data);
  return { data, error };
}

export async function AddFavorite(
  paperId: string
): Promise<PostgrestError | null> {
  const user = await GetUser();
  if (user === null) {
    return null;
  }

  const user = await GetUser();
  if (user === null) {
    return null;
  }

  const { error } = await supabase
    .from("favorites")
    .insert({ paper_id: paperId, user_id: user.id });
    .insert({ paper_id: paperId, user_id: user.id });
  return error;
}

export async function GetPreferredPapers(): Promise<{
  data: PaperCard[];
  error: any;
}> {
  const { data, error } = await supabase.functions.invoke(
    "create-recommendation",
    {
      body: {
        matchThreshold: 0.2,
        maxResults: 10,
      },
    }
  );

  const paperRes = data.message;
  const papers = paperRes.map((paper: any) => ({
    id: paper.id,
    link: paper.link,
    title: paper.title,
    summary: paper.summary,
    starred: paper.is_favorited,
  }));
  return { data: papers, error };
}

export async function mockGetPreferredPapers(): Promise<{
  data: PaperCard[];
  error: any;
}> {
  const data: PaperCard[] = [
    {
      id: "1",
      link: "https://arxiv.org/abs/2106.01442",
      title: "Title 1",
      summary:
        "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
      starred: false,
    },
    {
      id: "2",
      link: "https://arxiv.org/abs/2106.01442",
      title: "Title 2",
      summary:
        "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
      starred: true,
    },
    {
      id: "21",
      link: "https://arxiv.org/abs/2106.01442",
      title: "Title 21",
      summary:
        "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
      starred: true,
    },
    {
      id: "22",
      link: "https://arxiv.org/abs/2106.01442",
      title: "Title 22",
      summary:
        "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
      starred: true,
    },
  ];

  return { data, error: null };
}

export async function SearchPapers(
  query: string
): Promise<{ data: PaperCard[]; error: any }> {
  const { data, error } = await supabase.functions.invoke(
    "search",
    "search",
    {
      body: {
        query: query + " research",
        matchThreshold: 0.2,
        maxResults: 10,
      },
    }
  );

  const paperRes = data.message.results;
  const papers = paperRes.map((paper: any) => ({
    id: paper.id,
    link: paper.link,
    title: paper.title,
    summary: paper.summary,
    starred: paper.is_favorited,
  }));
  return { data: papers, error };
}

export async function mockSearchPapers(
  query: string
): Promise<{ data: PaperCard[]; error: any }> {
  const data: PaperCard[] = [
    {
      id: "3",
      link: "https://arxiv.org/abs/2106.01442",
      title: "Title 3",
      summary:
        "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
      starred: false,
    },
    {
      id: "4",
      link: "https://arxiv.org/abs/2106.01442",
      title: "Title 4",
      summary:
        "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
      starred: false,
    },
    {
      id: "31",
      link: "https://arxiv.org/abs/2106.01442",
      title: "Title 31",
      summary:
        "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
      starred: false,
    },
    {
      id: "41",
      link: "https://arxiv.org/abs/2106.01442",
      title: "Title 41",
      summary:
        "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
      starred: false,
    },
  ];

  return { data, error: null };
}
