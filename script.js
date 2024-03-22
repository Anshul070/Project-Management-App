var addCon = document.getElementById('addCon');
var PRdes = document.getElementById("PRdes");
var PRname = document.getElementById("PRname");
var CreateButton = document.getElementById("CreateButton");
var gridList = document.getElementById("grid-list")
var taskInfo = document.getElementsByClassName('task-info')
const divs = document.querySelectorAll('.task-info');
var projectName = document.getElementById('projectName');
var projectDescription = document.getElementById('projectDescription');
var TodayTask = document.getElementById("TodayTask");
var upcomingTask = document.getElementById("upcomingTask");
var option = document.getElementById('option');
var select = document.getElementsByTagName('select');
var addButton = document.getElementById('addButton');
var taskOperation = document.getElementById('taskOperation');
var show = 0;
var selectedProject = '';
var search = document.getElementById('search');
var checkBoxValue = 0;
var DragedUpcomingTask = '';
const audio = new Audio('notification1.mp3');
var colors = [
    "linear-gradient(rgb(190, 255, 190) , rgb(17, 218, 94))",
    "linear-gradient(rgb(190, 250, 255) , rgb(17, 195, 218))",
    "linear-gradient(rgb(237, 255, 190) , rgb(191, 218, 17))",
    "linear-gradient(rgb(255, 190, 190) , rgb(218, 84, 17))",
    "linear-gradient(rgb(255, 190, 232) , rgb(218, 17, 188))",
    "linear-gradient(rgb(203, 190, 255) , rgb(158, 17, 218))",
]
function ClearProjectTask() {
    if (localStorage.TodayProjectsTasks) {
        var LocalStorage = JSON.parse(localStorage.TodayProjectsTasks);
        if (LocalStorage.length === 0) {
            localStorage.removeItem("TodayProjectsTasks");
        }
    }
    if (localStorage.UpcomingProjectsTasks) {
        var LocalStorage = JSON.parse(localStorage.UpcomingProjectsTasks);
        if (LocalStorage.length === 0) {
            localStorage.removeItem("UpcomingProjectsTasks");
        }
    }
}
ClearProjectTask();

//drag and drop: tasks from upcoming tasks can be droped from today tasks
upcomingTask.addEventListener('dragover', (ev) => {
    ev.preventDefault();
    try {
        var dragItem = document.querySelector('.dragging');
        var a = dragItem.childNodes;
        var b = a[0].childNodes;
        DragedUpcomingTask = b[1].innerHTML
    }
    catch (e) {
        console.log('ERROR:' + e);
    }
});
upcomingTask.addEventListener('drop', (ev) => {
    if (DragedUpcomingTask !== null && DragedUpcomingTask !== "") {
        DropUpcomingTask(DragedUpcomingTask);
        RemoveTodayTask(DragedUpcomingTask);
        DragedUpcomingTask = "";
    }
});

//update the droped takses in local storage
function DropUpcomingTask(taskName) {
    var Exist = false;
    var ProjectTasks = { "projectId": selectedProject, "upcomingTask": { 'task': [taskName] } }
    var Tasks = [];
    Tasks.push(ProjectTasks);
    var StringJson = JSON.stringify(Tasks);
    if (localStorage.UpcomingProjectsTasks) {
        var checkId = JSON.parse(localStorage.UpcomingProjectsTasks);
        checkId.forEach((element) => {
            if (element.projectId === selectedProject) {
                element.upcomingTask.task.push(ProjectTasks.upcomingTask.task[0]);
                localStorage.UpcomingProjectsTasks = JSON.stringify(checkId);
                Exist = true;
            }
        })
        if (!Exist) {
            localStorage.UpcomingProjectsTasks += StringJson;
            var LocalString = localStorage.UpcomingProjectsTasks;
            var CorrectString = LocalString.replace("][", ",");
            localStorage.UpcomingProjectsTasks = CorrectString;
        }
    }
    else {
        localStorage.UpcomingProjectsTasks = StringJson;
    }
    updateUpcomingTasks();
}

// When task from today task droped into upcoming task then the are updated in localstorage 
function RemoveTodayTask(taskName) {
    var AllTasks = JSON.parse(localStorage.TodayProjectsTasks);
    AllTasks.forEach((element, elementIndex) => {
        if (element.projectId === selectedProject) {
            var arr = element.todayTask.task;
            arr.forEach((task, index) => {
                if (task === taskName) {
                    element.todayTask.task.splice(index, 1);
                    element.todayTask.indicator.splice(index, 1);
                }
            });
            if (arr.length === 0) {
                AllTasks.splice(elementIndex, 1);
            }
        };
    });
    var StringJson = JSON.stringify(AllTasks);
    localStorage.TodayProjectsTasks = StringJson;
    updateTodayTasks();
}

search.addEventListener('input', (e) => {
    var Projects = document.querySelectorAll('.ProjectName');
    var TaskInfo = document.querySelectorAll('.task-info');
    const value = e.target.value.toLowerCase();
    Projects.forEach((project, index) => {
        const isvisible = project.innerText.toLowerCase().includes(value);
        TaskInfo[index].classList.toggle('hide', !isvisible);
    });
});

setInterval(() => {
    upDate();
    alertNotifier();
    console.log(localStorage.tommorowDate);
}, 3600000);


// for updating upcoming tasks to today task after a day 
function upDate() {
    var a = new Date().getDate();
    if (localStorage.tommorowDate) {
        if (localStorage.tommorowDate === `${a}`) {
            if (localStorage.UpcomingProjectsTasks) {
                console.log(a);
                var structUpcoming = JSON.parse(localStorage.UpcomingProjectsTasks);
                if (localStorage.TodayProjectsTasks) {
                    var structToday = JSON.parse(localStorage.TodayProjectsTasks);
                    structUpcoming.forEach((element, index) => {
                        structToday.forEach((task) => {
                            if (element.projectId === task.projectId) {
                                element.upcomingTask.task.forEach((upcomingTask, taskIndex) => {
                                    task.todayTask.task.push(upcomingTask);
                                    task.todayTask.indicator.push('indicators-waiting');
                                })
                            }
                            else {
                                var taskStruct = { 'projectId': element.projectId, 'todayTask': { 'task': element.upcomingTask.task, 'indicator': [] } }
                                element.upcomingTask.task.forEach((a, b) => {
                                    taskStruct.todayTask.indicator.push("indicators-waiting");
                                })
                                structToday.push(taskStruct);
                            }
                        })
                    });
                    var structString = JSON.stringify(structToday);
                    localStorage.TodayProjectsTasks = structString;
                    localStorage.tommorowDate++;
                }
                else {
                    var structToday = []
                    structUpcoming.forEach((element) => {
                        var taskStruct = { 'projectId': element.projectId, 'todayTask': { 'task': element.upcomingTask.task, 'indicator': [] } }
                        element.upcomingTask.task.forEach((a, b) => {
                            taskStruct.todayTask.indicator.push("indicators-waiting");
                        });
                        structToday.push(taskStruct);
                    });
                    var structString = JSON.stringify(structToday);
                    localStorage.TodayProjectsTasks = structString;
                }
                localStorage.removeItem("UpcomingProjectsTasks");
                updateTodayTasks();
                updateUpcomingTasks();
            }
            else {
                localStorage.tommorowDate = a + 1;
            }
        }
    }
    else {
        localStorage.tommorowDate = a + 1;
    }
}

//it will show an alert for notifying pending tasks
function alertNotifier() {
    var AllTask = JSON.parse(localStorage.TodayProjectsTasks);
    var pendingTask = 0;
    var waitingTask = 0;
    AllTask.forEach((element) => {
        element.todayTask.indicator.forEach((indicator, index) => {
            if (indicator === 'indicators-inprogress') {
                pendingTask++;
            }
            else if (indicator === 'indicators-waiting') {
                waitingTask++;
            }
            else { }

        });
    });
    audio.onended = function () { alert(`You have ${pendingTask} pending and ${waitingTask} waiting tasks`) }
    audio.play();
}


function popup() {
    if (show === 0) {
        addCon.classList.add('addConPopUp');
        taskOperation.style.opacity = 100;
        taskOperation.style.visibility = 'visible';

        addButton.innerText = 'x';
        show++;
    }
    else {
        taskOperation.style.opacity = 0;
        taskOperation.style.visibility = 'hidden';
        addCon.classList.remove('addConPopUp');
        addButton.innerText = '+';
        show--;
    }
}
if (!localStorage.ProjectId) {
    localStorage.ProjectId = '0';
}
else {
}
updateProjectList();
updateTodayTasks();
updateUpcomingTasks();

//Working Of Select Tag
function Operation(selectID) {
    var selectElement = document.getElementById(selectID)
    if(selectedProject !== ''){

    if (selectElement.value === 'Add') {
        var Exist = false;
        if (selectElement.id === "operation") {
            TodayTask.innerHTML = '';
            var Alignment = document.createElement('div');
            Alignment.className = 'alignment';
            var Div = document.createElement('div');
            var InputTask = document.createElement('input');
            InputTask.id = 'TaskInput';
            InputTask.placeholder = "Enter Task"
            var btn = document.createElement('input');
            btn.type = "button";
            btn.id = "TaskCreator";
            btn.value = "Done";
            btn.addEventListener("click", () => {
                if (TaskInput.value !== '') {
                    AddTask(selectElement);
                }
                else {
                    audio.onended = function () { alert("You can't create a nameless task"); }
                    audio.play();

                }
            });
            var Indicator = document.createElement('select');
            Indicator.id = 'IndicatorSelecter';
            Indicator.innerHTML = '<option value="indicators-approved">Approved</option><option value="indicators-inprogress">In-Progress</option><option value="indicators-waiting">In-Waiting</option>'
            Div.appendChild(InputTask);
            Alignment.appendChild(Div);
            Alignment.appendChild(Indicator);
            Alignment.appendChild(btn);
        }
        else {
            upcomingTask.innerHTML = '';
            var Alignment = document.createElement('div');
            Alignment.className = 'alignment';
            var Div = document.createElement('div');
            var InputTask = document.createElement('input');
            InputTask.id = 'TaskInput';
            InputTask.placeholder = "Enter Task"
            var btn = document.createElement('input');
            btn.type = "button";
            btn.id = "TaskCreator";
            btn.value = "Done";
            btn.addEventListener("click", () => {
                if (TaskInput.value !== '') {
                    AddTask(selectElement);
                }
                else {
                    audio.onended = function () { alert("You can't create a nameless task"); }
                    audio.play();
                }
            });
            Div.appendChild(InputTask);
            Alignment.appendChild(Div);
            Alignment.appendChild(btn);
        }
        if (selectElement.id === "operation") {
            TodayTask.appendChild(Alignment);
        }
        else {
            upcomingTask.appendChild(Alignment);
        }
    }
    else if (selectElement.value === 'Edit') {
        if (localStorage.TodayProjectsTasks || localStorage.UpcomingProjectsTasks) {
            if (selectElement.id === "operation") {
                var arr = JSON.parse(localStorage.TodayProjectsTasks);
                arr.forEach((element) => {
                    if (element.projectId === selectedProject) {
                        TodayTask.innerHTML = '';
                        element.todayTask.task.forEach((tasks) => {


                            var Alignment = document.createElement('div');
                            Alignment.className = 'alignment';
                            var Div = document.createElement('div');
                            var InputTask = document.createElement('input');
                            InputTask.className = 'TaskInput';
                            InputTask.value = tasks;
                            var Indicator = document.createElement('select');
                            Indicator.id = 'IndicatorSelecter';
                            Indicator.className = 'EditedIndicator'
                            Indicator.innerHTML = '<option value="indicators-approved">Approved</option><option value="indicators-inprogress">In-Progress</option><option value="indicators-waiting">In-Waiting</option>'
                            Div.appendChild(InputTask);
                            Alignment.appendChild(Div);
                            Alignment.appendChild(Indicator);
                            TodayTask.appendChild(Alignment);
                        })
                        var btn = document.createElement('input');
                        btn.type = "button";
                        btn.id = "TaskCreator";
                        btn.value = "Edit";
                        btn.addEventListener("click", e => EditTask(selectElement));
                        TodayTask.appendChild(btn);
                        Exist = true;
                    }
                })
                if (!Exist) {
                    TodayTask.innerHTML = 'Nothing to edit';
                }
            }
            else {
                var arr = JSON.parse(localStorage.UpcomingProjectsTasks);
                arr.forEach((element) => {
                    if (element.projectId === selectedProject) {
                        upcomingTask.innerHTML = '';
                        element.upcomingTask.task.forEach((tasks) => {


                            var Alignment = document.createElement('div');
                            Alignment.className = 'alignment';
                            var Div = document.createElement('div');
                            var InputTask = document.createElement('input');
                            InputTask.className = 'TaskInput';
                            InputTask.value = tasks;
                            var Indicator = document.createElement('input');
                            Indicator.value = "In-Waiting"
                            Indicator.className = 'EditedIndicator indicators-waiting'
                            Indicator.type = 'button';
                            Div.appendChild(InputTask);
                            Alignment.appendChild(Div);
                            Alignment.appendChild(Indicator);
                            upcomingTask.appendChild(Alignment);

                        })
                        var btn = document.createElement('input');
                        btn.type = "button";
                        btn.id = "TaskCreator";
                        btn.value = "Edit";
                        btn.addEventListener("click", e => EditTask(selectElement));
                        upcomingTask.appendChild(btn);
                        Exist = true;
                    }
                })
                if (!Exist) {
                    upcomingTask.innerHTML = 'Nothing to edit';
                }
            }


        }
        else {
            if (selectElement.id === "operation") {
                TodayTask.innerHTML = 'No project created yet.';
            }
            else {
                upcomingTask.innerHTML = 'No project created yet.';
            }
        }
    }
    else {
        if (localStorage.TodayProjectsTasks || localStorage.UpcomingProjectsTasks) {
            if (selectElement.id === "operation") {
                TodayTask.innerHTML = '';
                var arr = JSON.parse(localStorage.TodayProjectsTasks);
                arr.forEach((element) => {
                    if (element.projectId === selectedProject) {
                        element.todayTask.task.forEach((tasks, index) => {


                            var Alignment = document.createElement('div');
                            Alignment.className = 'alignment';
                            var Div = document.createElement('div');
                            var Itag = document.createElement('input');
                            Itag.type = "checkbox"
                            Itag.className = 'CheckBox';
                            Itag.value = checkBoxValue;
                            checkBoxValue++;
                            var H5 = document.createElement('h5');
                            H5.innerText = tasks;
                            var Input = document.createElement('input');
                            Input.className = element.todayTask.indicator[index];
                            if (element.todayTask.indicator[index] === 'indicators-approved') {
                                Input.value = 'Approved'
                            }
                            else if (element.todayTask.indicator[index] === 'indicators-inprogress') {
                                Input.value = 'In-Progress'
                            }
                            else {
                                Input.value = 'In-Waiting'
                            }
                            Input.type = 'button';
                            Div.appendChild(Itag);
                            Div.appendChild(H5);
                            Alignment.appendChild(Div);
                            Alignment.appendChild(Input);
                            TodayTask.appendChild(Alignment);



                        })
                        var btn = document.createElement('input');
                        btn.type = "button";
                        btn.id = "TaskCreator";
                        btn.value = "Delete";
                        btn.addEventListener("click", e => DeleteTask(selectElement));
                        checkBoxValue = 0;
                        TodayTask.appendChild(btn);
                        Exist = true;
                    }
                });
                if (!Exist) {
                    TodayTask.innerHTML = 'Nothing to Delete';
                }
            }
            else {
                upcomingTask.innerHTML = '';
                var arr = JSON.parse(localStorage.UpcomingProjectsTasks);
                arr.forEach((element) => {
                    if (element.projectId === selectedProject) {
                        element.upcomingTask.task.forEach((tasks, index) => {


                            var Alignment = document.createElement('div');
                            Alignment.className = 'alignment';
                            var Div = document.createElement('div');
                            var Itag = document.createElement('input');
                            Itag.type = "checkbox"
                            Itag.className = 'CheckBox';
                            Itag.value = checkBoxValue;
                            checkBoxValue++;
                            var H5 = document.createElement('h5');
                            H5.innerText = tasks;
                            var Input = document.createElement('input');
                            Input.className = 'indicators-waiting'
                            Input.value = 'In-Waiting'
                            Input.type = 'button';
                            Div.appendChild(Itag);
                            Div.appendChild(H5);
                            Alignment.appendChild(Div);
                            Alignment.appendChild(Input);
                            upcomingTask.appendChild(Alignment);



                        })
                        var btn = document.createElement('input');
                        btn.type = "button";
                        btn.id = "TaskCreator";
                        btn.value = "Delete";
                        btn.addEventListener("click", e => DeleteTask(selectElement));
                        checkBoxValue = 0;
                        Exist = true;
                        upcomingTask.appendChild(btn);
                    }
                });
                if (!Exist) {
                    upcomingTask.innerHTML = 'Nothing to Delete';
                }
            }
        }
        else {
            if (selectElement.id === "operation") {
                TodayTask.innerHTML = 'No project created yet.';
            }
            else {
                upcomingTask.innerHTML = 'No project created yet.';
            }
        }
    }
    }
    else{
        if (selectElement.id === "operation") {
            TodayTask.innerHTML = 'Please select any project or create a project first.';
        }
        else {
            upcomingTask.innerHTML = 'Please select any project or create a project first.';
        }
    }
    selectElement.selectedIndex = 0;
}


//Create Task And Add it
function AddTask(selectElement) {
    var TaskInput = document.getElementById('TaskInput');
    var IndicatorSelecter = document.getElementById('IndicatorSelecter');
    var Exist = false;
    if (selectElement.id === "operation") {
        var ProjectTasks = { "projectId": selectedProject, "todayTask": { 'task': [TaskInput.value], 'indicator': [!IndicatorSelecter.value ? "indicators-approved" : IndicatorSelecter.value] } }
        var Tasks = [];
        Tasks.push(ProjectTasks);
        var StringJson = JSON.stringify(Tasks);
        if (localStorage.TodayProjectsTasks) {
            var checkId = JSON.parse(localStorage.TodayProjectsTasks);
            checkId.forEach((element) => {
                if (element.projectId === selectedProject) {
                    element.todayTask.task.push(ProjectTasks.todayTask.task[0]);
                    element.todayTask.indicator.push(ProjectTasks.todayTask.indicator[0]);
                    localStorage.TodayProjectsTasks = JSON.stringify(checkId);
                    Exist = true;
                }
            })
            if (!Exist) {
                localStorage.TodayProjectsTasks += StringJson;
                var LocalString = localStorage.TodayProjectsTasks;
                var CorrectString = LocalString.replace("][", ",");
                localStorage.TodayProjectsTasks = CorrectString;
            }
        }
        else {
            localStorage.TodayProjectsTasks = StringJson;
        }
        updateTodayTasks();

    }
    else {
        var ProjectTasks = { "projectId": selectedProject, "upcomingTask": { 'task': [TaskInput.value] } }
        var Tasks = [];
        var Exist = false;
        Tasks.push(ProjectTasks);
        var StringJson = JSON.stringify(Tasks);
        if (localStorage.UpcomingProjectsTasks) {
            var checkId = JSON.parse(localStorage.UpcomingProjectsTasks);
            checkId.forEach((element) => {
                if (element.projectId === selectedProject) {
                    element.upcomingTask.task.push(ProjectTasks.upcomingTask.task[0]);
                    localStorage.UpcomingProjectsTasks = JSON.stringify(checkId);
                    Exist = true;
                }
            })
            if (!Exist) {
                localStorage.UpcomingProjectsTasks += StringJson;
                var LocalString = localStorage.UpcomingProjectsTasks;
                var CorrectString = LocalString.replace("][", ",");
                localStorage.UpcomingProjectsTasks = CorrectString;
            }
        }
        else {
            localStorage.UpcomingProjectsTasks = StringJson;
        }
        updateUpcomingTasks();
    }
}

// For Editing Tasks
function EditTask(selectElement) {
    if (selectElement.id === "operation") {
        var AllTasks = JSON.parse(localStorage.TodayProjectsTasks);
        var EditedTasks = document.querySelectorAll(".TaskInput");
        var EditedIndicator = document.querySelectorAll(".EditedIndicator");
        AllTasks.forEach((element) => {
            if (element.projectId === selectedProject) {
                EditedTasks.forEach((tasks, index) => {
                    element.todayTask.task[index] = tasks.value;
                });
                EditedIndicator.forEach((tasks, index) => {
                    element.todayTask.indicator[index] = tasks.value;
                })
                var StringJson = JSON.stringify(AllTasks);
                localStorage.TodayProjectsTasks = StringJson;
            }
        });
        updateTodayTasks();
    }
    else {
        var AllTasks = JSON.parse(localStorage.UpcomingProjectsTasks);
        var EditedTasks = document.querySelectorAll(".TaskInput");
        AllTasks.forEach((element) => {
            if (element.projectId === selectedProject) {
                EditedTasks.forEach((tasks, index) => {
                    element.upcomingTask.task[index] = tasks.value;
                });
                var StringJson = JSON.stringify(AllTasks);
                localStorage.UpcomingProjectsTasks = StringJson;
            }
        });
        updateUpcomingTasks();
    }
}

//For Deleting Tasks
function DeleteTask(selectElement) {
    if (selectElement.id === "operation") {
        var arr = [];
        var AllTasks = JSON.parse(localStorage.TodayProjectsTasks);
        var Checkboxes = document.querySelectorAll(".CheckBox");
        Checkboxes.forEach((element) => {
            if (element.checked) {
                arr.push(element.value);
            }
        });
        var arr1 = arr.reverse();

        AllTasks.forEach((element, elementIndex) => {
            if (element.projectId === selectedProject) {

                arr1.forEach((index) => {
                    element.todayTask.task.splice(index, 1);
                    element.todayTask.indicator.splice(index, 1);
                });
                if (element.todayTask.task.length === 0) {
                    AllTasks.splice(elementIndex, 1);
                }
                var StringJson = JSON.stringify(AllTasks);
                localStorage.TodayProjectsTasks = StringJson;
            }
            arr = [];
        });

        updateTodayTasks();
    }
    else {
        var arr = [];
        var AllTasks = JSON.parse(localStorage.UpcomingProjectsTasks);
        var Checkboxes = document.querySelectorAll(".CheckBox");
        Checkboxes.forEach((element) => {
            if (element.checked) {
                arr.push(element.value);
            }
        });
        var arr1 = arr.reverse();

        AllTasks.forEach((element, elementIndex) => {
            if (element.projectId === selectedProject) {

                arr1.forEach((index) => {
                    element.upcomingTask.task.splice(index, 1);
                });
                if (element.upcomingTask.task.length === 0) {
                    AllTasks.splice(elementIndex, 1);
                }
                var StringJson = JSON.stringify(AllTasks);
                localStorage.UpcomingProjectsTasks = StringJson;
            }
            arr = [];
        });

        updateUpcomingTasks();
    }


}






//It creates and shows how many projects we have .
CreateButton.addEventListener("click", () => {
    if (PRdes.value !== '' && PRname.value !== '') {
        var a = {};
        var projectList = [];
        var strProjects = "";
        var jsonString = "";
        a = { 'name': PRname.value, 'description': PRdes.value, 'ProjectId': localStorage.ProjectId };
        projectList.push(a);
        localStorage.ProjectId++;
        if (localStorage.projects) {
            localStorage.projects += JSON.stringify(projectList);
            jsonString = localStorage.projects
            strProjects = jsonString.replace('][', ',');
            localStorage.projects = strProjects;
            taskOperation.style.opacity = 0;
            taskOperation.style.visibility = 'hidden';
            addCon.classList.remove('addConPopUp');
            addButton.innerText = '+';
            show--;
        }
        else {
            localStorage.projects = JSON.stringify(projectList);
            taskOperation.style.opacity = 0;
            taskOperation.style.visibility = 'hidden';
            addCon.classList.remove('addConPopUp');
            addButton.innerText = '+';
            show--;
        }
        PRname.value = "";
        PRdes.value = "";
        updateProjectList();
    }
    else {
        alert('Please fill the info correctly');
    }
});



function updateProjectList() {
    var totalProjects = document.getElementById('totalProjects');
    gridList.innerHTML = "";
    var colorIndex = 0;
    if (localStorage.projects) {
        var parseProjects = [];
        parseProjects = JSON.parse(localStorage.projects);
        totalProjects.innerHTML = `(${parseProjects.length})`;
        parseProjects.forEach((project, index) => {
            if (index >= 6) {
                var AllTask = document.querySelectorAll('.task-info');
                var last = AllTask.item(AllTask.length - 1)
                last.innerHTML = "";
                var taskInfo = document.createElement('div');
                taskInfo.className = 'task-info';
                var taskImg = document.createElement('div');
                taskImg.className = 'taskImg';
                taskImg.style.background = colors[colorIndex];
                last.style.boxShadow = `2px 2px 10px grey`;
                taskImg.innerHTML = `${parseProjects.length - 5}+`;
                var Name = document.createElement('span');
                Name.innerText = `MORE`;
                last.appendChild(taskImg);
                last.appendChild(Name);


            }
            else {
                var taskInfo = document.createElement('div');
                taskInfo.className = 'task-info';
                var taskImg = document.createElement('div');
                taskImg.className = 'taskImg';
                if (colorIndex <= 5) {
                    taskImg.style.background = colors[colorIndex];
                    taskImg.style.boxShadow = `2px 2px 10px grey`;
                    colorIndex++
                }
                else {
                    colorIndex = 0;
                    taskImg.style.boxShadow = `2px 2px 10px grey`;
                    taskInfo.style.background = colors[colorIndex];

                }
                var shortName = project.name.split(" ");
                shortName.forEach((element) => {
                    taskImg.innerHTML += element[0];
                })
                taskImg.innerHTML
                var Name = document.createElement('span');
                Name.innerText = `${project.name}`;
                Name.className = 'ProjectName';
                taskInfo.appendChild(taskImg);
                taskInfo.appendChild(Name);
                taskInfo.addEventListener("click", () => {
                    projectName.innerText = project.name;
                    projectDescription.innerText = project.description;
                    Selected(project.ProjectId);
                })
                gridList.appendChild(taskInfo);
            }
        })
    }
    else {
        gridList.innerHTML = "No Projects Yet";

    }
}


//Selected Function to know which function is going to be selected.....
function Selected(prId) {
    selectedProject = prId;
    updateTodayTasks();
    updateUpcomingTasks();
}
function updateTodayTasks() {
    ClearProjectTask();
    var Exist = false;

    if (selectedProject === "") {
        TodayTask.innerHTML = 'Select Any Project'
    }
    else if (localStorage.TodayProjectsTasks) {

        TodayTask.innerHTML = "";
        var AllTodayTasks = JSON.parse(localStorage.TodayProjectsTasks);
        AllTodayTasks.forEach((element) => {
            if (element.projectId === selectedProject) {
                Exist = true;
                element.todayTask.task.forEach((task, index) => {
                    var Alignment = document.createElement('div');
                    Alignment.className = 'alignment';
                    var Div = document.createElement('div');
                    var Itag = document.createElement('i');
                    Itag.className = 'bx bx-list-ul list';
                    var H5 = document.createElement('h5');
                    H5.innerText = task;
                    var Input = document.createElement('input');
                    Input.className = element.todayTask.indicator[index];
                    if (element.todayTask.indicator[index] === 'indicators-approved') {
                        Input.value = 'Approved'
                    }
                    else if (element.todayTask.indicator[index] === 'indicators-inprogress') {
                        Input.value = 'In-Progress'
                    }
                    else {
                        Input.value = 'In-Waiting'
                    }
                    Input.type = 'button';
                    Div.appendChild(Itag);
                    Div.appendChild(H5);
                    Alignment.appendChild(Div);
                    Alignment.appendChild(Input);

                    Alignment.draggable = true;
                    Alignment.addEventListener("dragstart", (ev) => {
                        ev.currentTarget.classList.add('dragging');

                    })
                    Alignment.addEventListener("dragend", (ev) => {
                        ev.currentTarget.classList.remove('dragging');
                    })
                    TodayTask.appendChild(Alignment);
                })
            }
        })
        if (!Exist) {
            TodayTask.innerHTML = ''
            TodayTask.innerHTML = 'No Task Created Yet'

        }
    }
    else {
        TodayTask.innerHTML = ''
        TodayTask.innerHTML = 'No Task Created Yet'

    }
}
function updateUpcomingTasks() {
    ClearProjectTask();
    var Exist = false;

    if (selectedProject === "") {
        upcomingTask.innerHTML = 'Select Any Project'
    }
    else if (localStorage.UpcomingProjectsTasks) {

        upcomingTask.innerHTML = "";
        var AllTodayTasks = JSON.parse(localStorage.UpcomingProjectsTasks);
        AllTodayTasks.forEach((element) => {
            if (element.projectId === selectedProject) {
                Exist = true;
                element.upcomingTask.task.forEach((task, index) => {
                    var AlignmentUp = document.createElement('div');
                    AlignmentUp.className = 'alignment';
                    var Div = document.createElement('div');
                    var Itag = document.createElement('i');
                    Itag.className = 'bx bx-list-ul list';
                    var H5 = document.createElement('h5');
                    H5.innerText = task;
                    var Input = document.createElement('input');
                    Input.className = 'indicators-waiting';
                    Input.value = 'In-Waiting'
                    Input.type = 'button';
                    Div.appendChild(Itag);
                    Div.appendChild(H5);
                    AlignmentUp.appendChild(Div);
                    AlignmentUp.appendChild(Input);
                    upcomingTask.appendChild(AlignmentUp);
                })
            }
        })
        if (!Exist) {
            upcomingTask.innerHTML = ''
            upcomingTask.innerHTML = 'No Task Created Yet'

        }
    }
    else {
        upcomingTask.innerHTML = ''
        upcomingTask.innerHTML = 'No Task Created Yet'

    }
}