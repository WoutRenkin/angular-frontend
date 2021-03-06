import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { AuthService } from "../auth/auth.service";
import { Group } from "../models/group.model";
import { GroupUser } from "../models/groupUser.model";
import { User } from "../models/user.model";
import { ToastrService } from 'ngx-toastr';
import { environment } from "../../environments/environment";

const BACKEND_URL = environment.apiUrl;


@Injectable({providedIn: "root"})
export class GroupService {
  group:Group;
  groupUpdated = new Subject<Group>();
  //Variable for logged in user
  user: User;
  //Variables for all groups of the company
  groups: Group[] = [];
  groupsUpdated = new Subject<Group[]>();

  //Variables for all groups from a user
  groupsFromUser: GroupUser[] = [];
  groupsFromUserUpdated = new Subject<GroupUser[]>();

  //Variables to get group of user
  userGroup: GroupUser;
  userGroupUpdated = new Subject<GroupUser>();

  //Variables to get all users in a group or not in a group
  groupUsers: GroupUser[] = [];
  groupUsersUpdated = new Subject<{groupUsers: GroupUser[], userCount: number}>();

  //Variable used to send a group to our edit page
  selectedItem = new Subject<Group>();

  constructor(private http: HttpClient, private router: Router, private authService: AuthService, private toastr: ToastrService){}

  getGroups() {
    const user: User = JSON.parse(localStorage.getItem('user'))
    if(user?.companyId) {
      this.http.get<any>(BACKEND_URL + "/Group/company/" + user.companyId)
      //I want to change the data bit so we call the pipe function
      .pipe(
        //We want to transform the data so we first call a map function
        map( response => {
          //Response is a list of groups so we call map on it so we can modify every object we received and we return the end result
          return response.map(group => {
            //We transform the individual group object and return it
            return {
              groupId: group.groupId,
              name: group.name,
              themeColor: group.themeColor,
              imagePath: group.imagePath,
              companyId: group.companyId
            }
          }
          )

      })
      )
      .subscribe(response => {
        this.groups = response;
        this.groupsUpdated.next([...this.groups])
      })
    }
  }

  //Call to get specific grou of user
  getGroupUser(user: User, groupId: number) {
    this.http.get<any>(BACKEND_URL + "/GroupUser/group/user/" + user.userID + "/" + groupId).pipe(map(response => {
      if(response) {
        return {
          groupUserId: response.groupUserId,
          groupModerator: response.moderator,
          moderatorRequest: response.requestedModerator,
          groupRequest: response.groupRequest,
          userId: response.userId,
          group: null,
          user: null,
        }
      } else {
        return null;
      }

    })).subscribe(response => {
     this.userGroup = response;
     this.userGroupUpdated.next(this.userGroup);
    })
  }

  //Create a group, with formData because of the picture
  createGroup (group: any, companyId: number) {
    const groupData = new FormData();
    groupData.append("name", group.name)
    groupData.append("themeColor", group.color)
    groupData.append("imagepath", group.imagePath)
    groupData.append("companyId", companyId.toString())
    this.http.post<any>(BACKEND_URL + "/Group", groupData).subscribe(
      response => {
        this.group = response;
        const updatedGroups = this.groups;
        updatedGroups.push(this.group);
        this.groupsUpdated.next([...updatedGroups])
        this.toastr.success('Group ' + this.group.name + " successfully added!");
      }
    )
  }

  //Delete a group
  deleteGroup (group: Group) {
    const groupId = group.groupId;
    return this.http.delete(BACKEND_URL + "/Group/" + groupId).subscribe(response => {
      const updatedGroups = this.groups.filter(group => group.groupId !== groupId);
      this.groups = updatedGroups;
      this.groupsUpdated.next([...this.groups]);
      this.toastr.success('Group ' + group.name + " successfully deleted!");
    })

  }

  //Update a group
  updateGroup(oldGroup: Group, group: any) {
    const groupData = new FormData();
    groupData.append('groupId', oldGroup.groupId.toString())
    groupData.append('name', group.name)
    groupData.append('themeColor', group.color)
    groupData.append('imagePath', group.imagePath)
    groupData.append('companyId', oldGroup.companyId.toString())
    this.http.put<any>(BACKEND_URL + "/Group/" + oldGroup.groupId, groupData).subscribe(response => {
      const updatedGroups = [...this.groups];
      const oldGroupIndex = updatedGroups.findIndex(g => g.groupId === response.groupId);
      updatedGroups[oldGroupIndex] = response;
      this.groups = updatedGroups;
      this.groupsUpdated.next([...this.groups]);
      this.toastr.success('Group ' + group.name + " successfully updated!");
    })
  }

  //Add a user to a group
  addUserToGroup(groupUser: GroupUser, groupId: number) {
    groupUser.groupUserId = null;
    groupUser.groupModerator = false;
    groupUser.moderatorRequest = false;
    groupUser.groupRequest = false;

    return this.http.post<any>(BACKEND_URL + "/GroupUser/",
    {
      moderator: groupUser.groupModerator,
      requestedModerator: groupUser.moderatorRequest,
      groupRequest: groupUser.moderatorRequest,
      userId: groupUser.user.userID,
      groupId: groupId,
      companyId: this.user.companyId
    })
  }

  //Get a specific group
  getGroup(groupId: Number) {

    this.http.get<any>(BACKEND_URL + "/Group/" + groupId).subscribe(response => {
      this.group = response;
      this.groupUpdated.next(this.group);
    }
    )
  }

  //Add a group request which is a post to groupUser table
  addRequestToGroup(group: Group) {

    const user: User = JSON.parse(localStorage.getItem('user'))
    this.http.post<any>(BACKEND_URL + "/GroupUser/",
    {
      moderator: false,
      requestedModerator: false,
      groupRequest: true,
      userId: user.userID,
      groupId: group.groupId,
      companyId: user.companyId
    }).subscribe(response => {
      this.toastr.success("Request to join group: " + group.name + " submitted!");
      const groupUser: GroupUser =
        {
          groupUserId: response.groupUserId,
          groupModerator: response.moderator,
          moderatorRequest: response.requestedModerator,
          groupRequest: response.groupRequest,
          userId: response.userId,
          user: null,
          group: {
            groupId: group.groupId,
            name: group.name,
            themeColor: group.themeColor,
            imagePath: group.imagePath,
            companyId: group.companyId
          }
      }
      this.groupsFromUser.push(groupUser);
      this.groupsFromUserUpdated.next([...this.groupsFromUser])

    })
  }

  //Delete an user from a group
  deleteGroupUser(groupUserId: number) {
    return this.http.delete(BACKEND_URL + "/GroupUser/" + groupUserId)
  }

  //Update a user in a group. Depending on what variables are send.
  updateGroupUser(groupUser: GroupUser, moderator: boolean = false, groupId: number, moderatorRequest: boolean = false) {
      if(moderator) {
        groupUser.groupModerator = true;
        groupUser.moderatorRequest = false;
      } else {
        groupUser.groupModerator = false
        if(moderatorRequest) {
          groupUser.moderatorRequest = true;
        } else {
          groupUser.moderatorRequest = false;

        }
      }

    return this.http.put(BACKEND_URL + "/GroupUser/" + groupUser.groupUserId, {
      GroupUserId: groupUser.groupUserId,
      moderator: groupUser.groupModerator,
      requestedModerator: groupUser.moderatorRequest,
      groupRequest: false,
      userId: groupUser.user.userID,
      groupId: groupId,
      companyId: groupUser.user.companyId
    });
  }

  //Get all users from a group.
  getGroupUsers(groupId: number, pageSize: number, currentPage: number, selectedValue: string, filter: string) {
    let nonMembers: boolean = false;
    let moderator: boolean = false;
    let groupRequests: boolean = false;
    let moderatorRequests: boolean = false;
    switch(selectedValue) {
      case "nonMembers":
        nonMembers = true;
        break;
      case "moderators":
        moderator = true;
        break;
      case "groupRequests":
        groupRequests = true;
        break;
      case "moderatorRequests":
        moderatorRequests = true;
        break;
      default:
        break;
    }

    this.user = JSON.parse(localStorage.getItem('user'))
    this.http.get<any>(BACKEND_URL + "/GroupUser/" + groupId + "/" + this.user.companyId,
    {params:
      {
        pageSize: pageSize,
        currentPage:currentPage,
        filter: filter,
        notInGroup: nonMembers,
        requestedModerator: moderatorRequests,
        moderator: moderator,
        groupRequest: groupRequests
      }})
      .pipe(
      map (response => {
        //We have two different maps here. One is for the users in a group
        //Other is for nonmembers, these don't have a groupUser record in the database so we map them to a groupUser model
        //I do this so we can iterate the same way over our lists
        const responseUsers =
       response.users.map(response => {
         if(nonMembers) {
          return {
            groupUserId: null,
            groupModerator: null,
            moderatorRequest:null,
            groupRequest: null,
            userId: response.userId,
            user: {
              userID: response.userID,
              email: response.email,
              firstName: response.firstName,
              lastName: response.lastName,
              roleId: response.roleID,
              companyId: response.companyId,
              _token: response.token,
           }
          }
         } else {
          return {
            groupUserId: response.groupUserId,
            groupModerator: response.moderator,
            moderatorRequest: response.requestedModerator,
            groupRequest: response.groupRequest,
            userId: response.userId,
            user: {
              userID: response.user.userID,
              email: response.user.email,
              firstName: response.user.firstName,
              lastName: response.user.lastName,
              roleId: response.user.roleID,
              companyId: response.user.companyId,
              _token: response.user.token,
           }
          }
         }

       })
       const totalUsers = response.totalUsers;
       return {responseUsers, totalUsers}
      })
      ).subscribe(
      response => {
        this.groupUsers = response.responseUsers
        this.groupUsersUpdated.next({groupUsers: [...this.groupUsers], userCount: response.totalUsers})
      }
    )
  }

  //Used to let the group edit component know which group to edit
  sendSelectedItem(group: Group) {
    this.selectedItem.next(group)
  }

  //Get all groups from an user.
  getUserGroups() {
    const user: User = JSON.parse(localStorage.getItem('user'))
    if(user){
      this.http.get<any>(BACKEND_URL + "/GroupUser/user/" + user.userID).pipe(
        map (response => {
          return response.map(response => {
            return {
              groupUserId: response.groupUserId,
              groupModerator: response.moderator,
              moderatorRequest: response.requestedModerator,
              groupRequest: response.groupRequest,
              userId: response.userId,
              user: user,
              group: {
                groupId: response.group.groupId,
                name: response.group.name,
                themeColor: response.group.themeColor,
                imagePath: response.group.imagePath,
                companyId: response.group.companyId
              }
            }
          }
          )
        }
      )
      ).subscribe(response => {
        this.groupsFromUser = response;
        this.groupsFromUserUpdated.next(this.groupsFromUser)
      })
    }

  }


}
