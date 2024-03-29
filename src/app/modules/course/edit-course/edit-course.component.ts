import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from 'src/app/models/category.model';
import { Course } from 'src/app/models/course.model';
import { Lecture } from 'src/app/models/lecturer.model';
import { categoryService } from 'src/app/services/category.service';
import { CourseService } from 'src/app/services/course.service';
import { LecturerService } from 'src/app/services/lecture.service';

@Component({
  selector: 'app-edit-course',
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.scss']
})
export class EditCourseComponent {
  selectedCategory: string;
  categories: Category[];
  private _currentCourse: Course;

  public get course(): Course {
    return this._currentCourse;
  }
  MyFormGroup: FormGroup = new FormGroup({
    "nameCourse": new FormControl('', [Validators.required]),
    "kodeCategory": new FormControl('', [Validators.required]),
    "amountLessons": new FormControl('', [Validators.required, Validators.min(1)]),
    "startCourseDate": new FormControl('', [Validators.required]),
    "syllabusArr": this.fb.array([]), // שימוש ב-FormArray כאן
    "wayLearning": new FormControl('', [Validators.required]),
    "image": new FormControl('', [Validators.required])
  });

  public set course(course: Course) {
    this._currentCourse = course;
  }

  courseToSave: Course;
  lect: Lecture;
  saveCourse() {
    this.videosArr = this.MyFormGroup.value['syllabusArr'].filter(video => video.trim() !== '');

    this.categories.forEach(category => {
      if (category.name == this.MyFormGroup.value["kodeCategory"])
        this.MyFormGroup.value["kodeCategory"] = category._id;
    })

    this.courseToSave = new Course(this.MyFormGroup.value["nameCourse"],  this.MyFormGroup.value["amountLessons"],
      this.MyFormGroup.value["startCourseDate"], this.MyFormGroup.value["syllabusArr"], this.MyFormGroup.value["wayLearning"],
      this.lect._id,
       this.MyFormGroup.value["image"]);

    this._courseService.putCourse(this.courseToSave, this.courseId).subscribe();
    alert("Course was added successfully!")
    this._router.navigate(['/allCourses'])
  }

  constructor(private _router: Router,
    private _courseService: CourseService,
    private _categoryService: categoryService,
    private _lecture: LecturerService,
    private _accr: ActivatedRoute,
    private fb:FormBuilder) {
    this._categoryService.getCategories().subscribe(res => {
      this.categories = res;
    }, (err => {
      console.log(err);
    }))
  }

  courseId: string;
  ngOnInit(): void {
    this._accr.paramMap.subscribe(paramMap => {
      if (paramMap.has("id")) {
        this.courseId = paramMap.get("id");
        this._courseService.getCourseById(paramMap.get("id")).subscribe(course => {
          this.course = course;
          this.MyFormGroup.patchValue({
            "nameCourse": this._currentCourse.nameCourse,
            "kodeCategory": this._currentCourse.kodeCategory,
            "amountLessons": this._currentCourse.amountLessons,
            "startCourseDate": this._currentCourse.startCourseDate,
            "syllabusArr": this._currentCourse.syllabusArr,
            "wayLearning": this.getwayLearning(),
            "kodeLecture": "",
            "image": this._currentCourse.image
          });
          
          const videosArr = this.MyFormGroup.get('syllabusArr') as FormArray;
          this._currentCourse.syllabusArr.forEach(video => {
            videosArr.push(this.fb.control(video));
          });
        
        })
      }
    })
  }
  getwayLearning() {
    if (String(this._currentCourse.wayLearning) == "zoom")
      return "zoom"
    return "frontaly"
  }
  videosArr: string[]
  addVideo() {
    const videosArr = this.MyFormGroup.get('syllabusArr') as FormArray;
    videosArr.push(this.fb.control(''));
  }

  removeVideo(index: number) {
    const videosArr = this.MyFormGroup.get('syllabusArr') as FormArray;
    videosArr.removeAt(index);
  }
}
