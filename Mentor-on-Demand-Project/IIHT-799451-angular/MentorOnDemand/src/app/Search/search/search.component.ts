import { Component, OnInit } from '@angular/core';
import { SkillServiceService } from 'src/app/services/Skill-service/skill-service.service';

import { Mentor_Skill } from 'src/app/model/Mentor_Skill';
import { MentorService } from 'src/app/services/mentor-service/mentor.service';
import { SearchServiceService } from 'src/app/services/Search-service/search-service.service';
import { AuthServiceService } from 'src/app/services/Authentication-service/auth-service.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { TrainingService } from 'src/app/services/training-service/training.service';
import { UserServiceService } from 'src/app/services/user service/user-service.service';
import { Training } from 'src/app/model/Training';
import { Skill } from 'src/app/model/Skill';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {


  skillList: Skill[];
  skillSearchKey: string;
  mentorList: Mentor_Skill[];
  requestTrainingMentorId: number = null;
  requestTrainingForm: FormGroup;
  errorMessage: string = null;
  clickname: String = null;

  constructor(private skillService: SkillServiceService, private mentorService: MentorService, private searchService: SearchServiceService, private authService: AuthServiceService, private formBuild: FormBuilder, private trainingService: TrainingService, private userService: UserServiceService) { }

  ngOnInit() {
    this.errorMessage = null;
    this.requestTrainingMentorId = null;

    this.skillSearchKey = null;
    this.skillList = [];
    this.skillService.getAllSkills().subscribe(
      (data) => {
        this.skillList = data;
      },
      (error) => {
        console.log(error);
      }
    )
  }
  searchBySkill() {
    let skill: Skill = this.skillList.find(skill => skill.name == this.skillSearchKey)

    this.mentorService.findMentorBySkill(skill).subscribe(
      (data) => {
        this.mentorList = data;

      },
      (error) => {
        console.log(error);

      }
    )
  }

  moreDetails(mentorskill: Mentor_Skill) {
    // this.moreInfoMentorId = mentorId;

    this.clickname = mentorskill.mentor.linkedinURL
  }
  lessDetails() {
    this.clickname = null;
  }

  requestTraining(mentorId: number) {
    this.userService.getCurrentUserFromDataBase();
    this.requestTrainingMentorId = mentorId;
    this.requestTrainingForm = this.formBuild.group({
      startDate: ['', [
        Validators.required,
        this.dateToday.bind(this),
        this.startAfterEnd.bind(this)
      ]],
      endDate: ['', [
        Validators.required,
        this.dateToday.bind(this),
        this.endBeforeStart.bind(this)
      ]]
    })
  }

  get startDate() {
    return this.requestTrainingForm.get('startDate');
  }

  get endDate() {
    return this.requestTrainingForm.get('endDate');
  }

  dateToday(formControl: FormControl): { [s: string]: boolean } {
    if (this.requestTrainingForm) {
      if (formControl.value) {
        let date: Date = new Date(formControl.value);
        let currentDate = new Date();
        if (date < currentDate) {
          return { 'nomatch': true };
        }
      }
    }
    return null;
  }

  endBeforeStart(formControl: FormControl): { [s: string]: boolean } {
    if (this.requestTrainingForm) {
      if (formControl.value) {
        let endDate: Date = new Date(formControl.value);
        let startdate = new Date(this.requestTrainingForm.get('startDate').value);
        if (startdate > endDate) {
          return { 'nomatch1': true };
        }
      }
    }
    return null;
  }

  startAfterEnd(formControl: FormControl): { [s: string]: boolean } {
    if (this.requestTrainingForm) {
      if (formControl.value) {
        let startdate: Date = new Date(formControl.value);
        let endDate = new Date(this.requestTrainingForm.get('endDate').value);
        if (startdate > endDate) {
          return { 'nomatch1': true };
        }
      }
    }
    return null;
  }

  submitRequestTraining(formData: any, mentorSkill: Mentor_Skill) {


    let trainingDetails: Training = {
      id: null, mentor: mentorSkill.mentor, endDate: formData["endDate"], progress: 0, rating: null,
      skill: mentorSkill.skill, startDate: formData["startDate"], status: "Request Pending", user: this.userService.getCurrentUser()
    }


    this.trainingService.sendTrainingRequest(trainingDetails).subscribe(
      (data) => {
        window.alert("Your details are submitted successfully");
      },
      (error) => {
        console.log(error);
        if (error.error.message == "Start Date Coincides with an existing approved training of Mentor") {
          this.errorMessage = "Start Date Coincides with an existing approved training of Mentor";
        }
        else if (error.error.message == "End Date Coincides with an existing approved training of Mentor") {
          this.errorMessage = "End Date Coincides with an existing approved training of Mentor";
        }
        else if (error.error.message == "Start Date Coincides with an existing approved training of User") {
          this.errorMessage = "Start Date Coincides with an existing approved training of User";
        }
        else if (error.error.message == "End Date Coincides with an existing approved training of User") {
          this.errorMessage = "End Date Coincides with an existing approved training of User";
        }
      }
    )
  }



}
