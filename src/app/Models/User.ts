export class User {
  id ?: string;
  fullname !: string;
  birthday ?: Date;
  email !: string;
  phone ?: string;
  password !: string;
  photoUrl !: string;

  constructor(fullname : string, email :string, phone : string, password : string){
    this.fullname = fullname;
    this.email = email;
    this.phone = phone;
    this.password = password;
  }
}
