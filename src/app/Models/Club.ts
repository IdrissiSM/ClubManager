export class Club {
  id ?: string;
  code ?: string;
  name !: string;
  description !: string;
  category !: string;
  logoUrl ?: string;

  constructor(code : string, name :string, description : string, category : string,logoUrl : string){
    this.code = code;
    this.name = name;
    this.description = description;
    this.category = category;
    this.logoUrl = logoUrl;
  }
}
