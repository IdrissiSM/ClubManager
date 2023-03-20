export interface User {
  id ?: string | null;
  fullname : string;
  birthday ?: Date;
  email : string;
  phone : string;
  photoUrl ?: string;
  password : string;
}
