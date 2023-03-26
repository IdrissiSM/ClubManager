export interface User {
  id ?: string | null;
  fullname : string;
  birthday ?: Date;
  email : string;
  phone : string;
  password : string;
  photoUrl ?: string;
  photoPath ?: string;
}
