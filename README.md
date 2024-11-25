# Wallace ArXiv

Built for Supabase x YC hackathon in November 2024.

Collects paper abstracts from the ArXiv API and creates embeddings with Voyage AI's voyage-3 model. Embeddings stored in
postgres with Supabase.
These vectors are compared with user preferences to generate reccomendations. Preferences are entered by users at signup
and further collected as they add papers
to their favorites.

Users can also 'chat' with the papers in their reccomendations. Chat completions from Anthropic.

![HomePage.png](HomePage.png)