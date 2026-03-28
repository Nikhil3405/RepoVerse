export interface Message{
    role: "user" | "assistant";
    content: string;
}

export interface Conversation{
    id: string;
    title: string;
    repo_id: string;
}

export interface Repo{
    id: string;
    repo_url: string;
}