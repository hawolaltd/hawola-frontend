export interface LoginFormType {
    email: string;
    password: string;
}

export interface RegisterFormType {
    email: string;
    username: string;
    password1: string;
    password2: string;
    terms?: string;
}

export interface ChangePasswordType {
    old_password: string;
    new_password: string;
}

export interface LoginResponse {
    access: string;
    refresh: string;
    user: {
        pk: number;
        email: string;
        phone_number: string;
        gender: number;
        username: string;
        last_name: string;
        first_name: string;
    }
}