import { ClubService } from './../../services/club.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController, PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Cell } from 'src/app/models/Cell';

@Component({
  selector: 'app-members',
  templateUrl: './members.page.html',
  styleUrls: ['./members.page.scss'],
})
export class MembersPage implements OnInit {

  constructor(
    private router : Router,
    private authService : AuthService,
    private alertController: AlertController,
    private clubService : ClubService,
    private toastController : ToastController,
    private popoverController : PopoverController
    )
  { }

  clubDetails !: any
  currentMember !: any
  currentUser !: any
  ngOnInit() {
    const currentClub = localStorage.getItem("currentClub")
    this.clubDetails = currentClub ? JSON.parse(currentClub) : null;
    const currentMember = localStorage.getItem("currentMember")
    this.currentMember = currentMember ? JSON.parse(currentMember) : null;
    const currentUser = localStorage.getItem("currentUser")
    this.currentUser = currentUser ? JSON.parse(currentUser) : null;
    this.initializeClub()
  }

  backToHome(){
    localStorage.removeItem('currentClub');
    localStorage.removeItem('currentMember');
    this.router.navigateByUrl("/home",{replaceUrl : true})
  }

  initializeClub(){
    this.getCountClubMembers()
    this.getCountClubCells()
    this.getClubMembersInCells()
    this.getMembersWithoutCell()
  }

  countClubMembers !: number
  getCountClubMembers(){
    this.clubService.getCountClubMembers(this.clubDetails.id)
    .then( count => {
      this.countClubMembers = count
    } )
  }

  countClubCells !: number
  getCountClubCells(){
    this.clubService.getCountClubCells(this.clubDetails.id)
    .then( count => {
      this.countClubCells = count
    } )
  }

  membersWithoutCell !: any
  async getMembersWithoutCell(){
    await this.clubService.getMembersWithoutCell(this.clubDetails.id)
    .then( async (members) => {
      this.membersWithoutCell = members
    })
  }

  cellsWithUsersList !: any
  async getClubMembersInCells(){
    await this.clubService.getClubMembersInCells(this.clubDetails.id)
    .then( list => {
      this.cellsWithUsersList = list
      console.log(list)
    })
  }

  async createCell(){
    const alert = await this.alertController.create({
      header: 'Create new cell',
      inputs: [
        {
          placeholder: 'Name',
          name : "name"
        },
        {
          placeholder: 'Type of Activity',
          name : "activity"
        },
        {
          type: 'textarea',
          placeholder: 'Description about new cell',
          name : "desription"
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add Cell',
          handler: async (data) => {
            const newCell : Cell = {
              idClub: this.clubDetails.id,
              name: data.name,
              description: data.desription
            }
            if(await this.addNewCell(newCell) !== null){
              const toast = await this.toastController.create({
                message: 'New cell created',
                duration: 2000,
                icon: 'checkmark-circle'
              });
              await toast.present();
            }else{
              const toast = await this.toastController.create({
                message: 'This cell already exists !',
                duration: 2000,
                icon: 'alert-circle'
              });
              await toast.present()
            }
          }
        },
      ],
    });
    await alert.present();
  }

  async addNewCell(cell : Cell){
    return await this.clubService.addNewCell(cell).then(() => {
      this.initializeClub()
    })
  }

  clubCells !: any
  async getClubCells(idClub : string,){
    await this.clubService.getClubCells(idClub).then( data => {
      this.clubCells = data
    })
  }

  async addMemberToCell(idUser : string,idCell : string,idClub : string){
    await this.clubService.addMemberToCell(idUser,idCell,idClub).then( () => {
      this.initializeClub()
    })
  }

  async removeFromCell(idUser : string){
    await this.popoverController.dismiss()
    await this.clubService.removeMemberFromCell(idUser,this.clubDetails.id).then( () => {
      this.initializeClub()
    })
  }


  async excludeMember(idUser : string){
    await this.popoverController.dismiss()
    await this.clubService.excludeMember(idUser,this.clubDetails.id).then( () => {
      this.initializeClub()
    })
  }


  async addToCell(idUser : string, changeOrAdd : string) {
    await this.getClubCells(this.clubDetails.id)
    let inputs : any = []
    this.clubCells.forEach((cell: { name: any; id: any; }) => {
      inputs.push(
        {
          label: cell.name,
          name : 'cell',
          type: 'radio',
          value: cell.id,
        }
      )
    });
    await this.popoverController.dismiss()
    const alert = await this.alertController.create({
      header: 'Select Cell',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: changeOrAdd,
          handler: async (data) => {
            await this.addMemberToCell(idUser,data,this.clubDetails.id)
          }
        },
      ],
      inputs: inputs,
    });

    await alert.present();
  }

  async alertDeleteCell(idCell : string,name : string){
    const alert = await this.alertController.create({
      header: `Are you sure you want to delete ${name} cell ?`,
      buttons: [
        {
          text: 'Yes',
          handler : async () => {
            // await this.alertController.dismiss();
            await this.deleteCell(idCell)
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ],
    });
    await alert.present();
  }

  async deleteCell(idCell : string){
    await this.clubService.deleteCell(idCell)
    this.initializeClub()
  }

  logout(){
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentClub');
    this.authService.logout()
    this.router.navigateByUrl("/welcome",{replaceUrl : true})
  }

}
