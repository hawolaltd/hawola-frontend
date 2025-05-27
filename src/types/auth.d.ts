export interface LoginFormType {
    username: string;
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

export interface ForgotPasswordFormType {
    email: string;
}

export interface ForgotPasswordConfirmFormType {
    new_password1: string;
    new_password2: string;
    uid: string;
    token: string;
}

export interface UserProfileResponse {
    pk: number;
    email: string;
    phone_number: string;
    gender: string;
    username: string;
    last_name: string;
    first_name: string;
}

export interface UpdateProfileDataType {
   phone_number?: string;
   gender?: string;
   username?: string;
   last_name?: string;
   first_name?: string;
   email?: string;
}
