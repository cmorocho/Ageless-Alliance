var ref, dataRef, userRef, elderRef, elderData, userData, user;

(function (jQuery, Firebase) {
    "use strict";

    // the main firebase authorization reference
    ref = new Firebase("https://ageless-link.firebaseio.com/web/uauth");
    dataRef = new Firebase("https://ageless-link.firebaseio.com");
    userRef = new Firebase("https://ageless-link.firebaseio.com/users");
    elderRef = new Firebase("https://ageless-link.firebaseio.com/elders");

}(window.jQuery, window.Firebase));

/*
check if a user is already logged in
 */
var authData = ref.getAuth();
if (authData) {
    console.log("User " + authData.uid + " is logged in with " + authData.provider);
    user = new Firebase("https://ageless-link.firebaseio.com/users/"+authData.uid);
    get_elder_data();
    get_user_data();
    update_user_info(authData);
    update_to_logout();
    if (window.location.pathname == "/user_accounts/new_log_entry.html")
        update_elder_options(user);
    if (window.location.pathname == "/user_accounts/log_history.html")
        update_log_history(user);
    if (window.location.pathname == "/user_accounts/account-official.html")
        update_recent_logs(user);
    if (window.location.pathname == "/user_accounts/contact.html")
        update_contact_page(user);
    if (window.location.pathname == "/user_accounts/account_settings.html")
        update_settings_page(user);
} else {
    update_to_login();
    console.log("User is logged out");
}

/*
    get userData and elderData
 */
function get_user_data() {
    var user_data;
    userRef.on("value", function(snapshot) {
        snapshot.forEach(function(data) {
            if (data.key() == authData.uid) {
                user_data = data;
            }
        });
        userData = user_data;
        check_if_matched();
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}
function get_elder_data() {
    var elder_data;
    elderRef.on("value", function(snapshot) {
        snapshot.forEach(function(data) {
            if (data.val().matches == "") {
                elder_data = data;
            }
        });
        elderData = elder_data;
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}

/*
    change login/logout indicator
 */
function update_to_logout() {
    userRef.on("value", function(snapshot) {
        snapshot.forEach(function(data) {
            if(data.key() == authData.uid) {
                var login_indicator1 = document.getElementById('login-indicator'),
                    login_indicator2 = document.getElementById('login-indicator2');
                if (login_indicator1 != null && login_indicator2 != null) {
                    login_indicator1.innerHTML = "<a href='#' class='link' onclick='redirect_to_user_page()' style='text-transform: none'>Hi, <b>" + data.val().name + "</b></a>";
                    login_indicator2.innerHTML = "<a href='#' class='btn btn-accent btn-small' onclick='logout()'>Logout</a>";
                }
            }
        });
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}
function update_to_login() {
    var login_indicator1 = document.getElementById('login-indicator'),
        login_indicator2 = document.getElementById('login-indicator2');
    if (login_indicator1 != null && login_indicator2 != null) {
        login_indicator1.innerHTML = "<a href='login.html' class='link'>Log in</a>";
        login_indicator2.innerHTML = "<a href='signup.html' class='btn btn-accent btn-small'>Sign up</a>";
    }
}

/*
    create new user
 */
function create_account() {
    var newEmail = document.getElementById("txtEmail").value,
        newPassword = document.getElementById("txtPass").value;
    ref.createUser({
        email    : newEmail,
        password : newPassword
    }, function(error, userData) {
        if (error) {
            console.log("Error creating user:", error);
        } else {
            console.log("Successfully created user account with uid:", userData.uid);
            add_new_user_to_database(userData, newEmail);
            redirect_to_login();
        }
    });
}
// add to database
function add_new_user_to_database(userData, user_email) {
    var today = new Date(),
        month = (today.getMonth()+ 1).toString(),
        year = (today.getFullYear()).toString();
    userRef.child(userData.uid).set({
        name: get_name(user_email),
        join_date: month + "/" + year,
        volunteer_status: "unofficial",
        phone_number: "",
        log_entries: "",
        matches: ""
    });
}
function get_name(email) {
    return email.replace(/@.*/, '');
}
function redirect_to_login() {
    window.location.href = 'login.html';
}

/*
    login
 */
function login() {
    var logEmail = document.getElementById("loginEmail").value,
        logPassword = document.getElementById("loginPassword").value;
    ref.authWithPassword({
        email    : logEmail,
        password : logPassword
    }, function(error, authData) {
        if (error) {
            console.log("Login Failed!", error);
        } else {
            console.log("Authenticated successfully with payload:", authData);
            redirect_to_user_page();
        }
    });
}
function redirect_to_user_page() {
    var authData = ref.getAuth();
    userRef.on("value", function(snapshot) {
        snapshot.forEach(function(data) {
            if(data.key() == authData.uid ) {
                if (data.val().volunteer_status == "official")
                    window.location = 'user_accounts/account-official.html';
                else if (data.val().volunteer_status == "unofficial")
                    window.location = 'user_accounts/volunteer-training.html';
            }
        });
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}
function update_settings_page(user) {
    var userStatusRef = userRef.child(authData.uid).child("volunteer_status"),
        navigation_menu = document.getElementById('navigation'),
        links = document.getElementById('description'),
        unofficial = 0,
        link_description = "",
        navigation = "";
    userStatusRef.on("value", function(snapshot) {
        if (snapshot.val() == "official") {
            navigation += "" +
                "<li class='sub-menu'>" +
                "<a href='account-official.html'>" +
                "<i class='fa fa-home'></i>" +
                "<span>Home</span>" +
                "</a>" +
                "</li>" +
                "<li class='sub-menu'>" +
                "<a href='log_history.html'>" +
                "<i class='fa fa-history'></i>" +
                "<span>Log History</span>" +
                "</a>" +
                "</li>" +
                "<li class='sub-menu'>" +
                "<a href='new_log_entry.html'>" +
                "<i class='fa fa-pencil'></i>" +
                "<span>Create New Log Entry</span>" +
                "</a>" +
                "</li>" +

                "<li class='sub-menu'>" +
                "<a href='javascript:;' class='active'>" +
                "<i class='fa fa-cogs'></i>" +
                "<span>Account Settings</span>" +
                "</a>" +
                "<ul class='sub'>" +
                "<li><a  href='account_settings.html'>Edit Account</a></li>" +
                "<li><a  href='#0' onclick='logout()'>Logout</a></li>" +
                "</ul>" +
                "</li>" +
                "<li><p style='color: #646a6f; padding-top: 30px; text-transform: uppercase'>Support</p></li>" +
                "<li class='sub-menu'>" +
                "<a href='contact.html'>" +
                "<i class='fa fa-user'></i>" +
                "<span>Contact</span>" +
                "</a>" +
                "</li>" +
                "<li class='sub-menu'>" +
                "<a href='handbook.html'>" +
                "<i class='fa fa-book'></i>" +
                "<span>Handbook</span>" +
                "</a>" +
                "</li>";
        }
        else if (snapshot.val() == "unofficial") {
            unofficial = 1;
            link_description = "To be able to link with elders, " +
                "you must first complete the checklist on your 'Home' page. If you have any questions or concerns, or are in " +
                "need of assistance in completing the checklist tasks, please contact Ageless Alliance. We look forward to " +
                "connecting you with an elder in the future!";
            navigation += "" +
                "<li class='sub-menu'>" +
                "<a href='volunteer-training.html'>" +
                "<i class='fa fa-home'></i>" +
                "<span>Home</span>" +
                "</a>" +
                "</li>" +

                "<li class='sub-menu'>" +
                "<a href='javascript:;' class='active'>" +
                "<i class='fa fa-cogs'></i>" +
                "<span>Account Settings</span>" +
                "</a>" +
                "<ul class='sub'>" +
                "<li><a  href='account_settings.html'>Edit Account</a></li>" +
                "<li><a  href='#0' onclick='logout()'>Logout</a></li>" +
                "</ul>" +
                "</li>" +
                "<li><p style='color: #646a6f; padding-top: 30px; text-transform: uppercase'>Support</p></li>" +
                "<li class='sub-menu'>" +
                "<a href='contact.html'>" +
                "<i class='fa fa-user'></i>" +
                "<span>Contact</span>" +
                "</a>" +
                "</li>";
        }
        if (unofficial == 1) {
            document.getElementById("match_request").disabled = true;
            links.innerHTML = link_description;
        }
        navigation_menu.innerHTML = navigation;
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}
function update_contact_page(user) {
    var userStatusRef = userRef.child(authData.uid).child("volunteer_status"),
        navigation_menu = document.getElementById('navigation'),
        message = document.getElementById("contact_intro"),
        navigation = "";
    userStatusRef.on("value", function(snapshot) {
        if (snapshot.val() == "official") {
            message.innerText = "In case of emergency, call 9-1-1 immediately. For handbook article suggestions, website bug reports, or any " +
            "further feedback and concerns, we'd love to hear from you! Feel free to " +
            "send us a message below or call Ageless Alliance with the phone number listed above.";
            navigation += "" +
                "<li class='sub-menu'>" +
                    "<a href='account-official.html'>" +
                    "<i class='fa fa-home'></i>" +
                    "<span>Home</span>" +
                    "</a>" +
                "</li>" +
                "<li class='sub-menu'>" +
                    "<a href='log_history.html'>" +
                    "<i class='fa fa-history'></i>" +
                    "<span>Log History</span>" +
                    "</a>" +
                "</li>" +
                "<li class='sub-menu'>" +
                    "<a href='new_log_entry.html'>" +
                        "<i class='fa fa-pencil'></i>" +
                        "<span>Create New Log Entry</span>" +
                    "</a>" +
                "</li>" +

                "<li class='sub-menu'>" +
                    "<a href='javascript:;' >" +
                        "<i class='fa fa-cogs'></i>" +
                        "<span>Account Settings</span>" +
                    "</a>" +
                    "<ul class='sub'>" +
                        "<li><a  href='account_settings.html'>Edit Account</a></li>" +
                        "<li><a  href='#0' onclick='logout()'>Logout</a></li>" +
                    "</ul>" +
                "</li>" +
                "<li><p style='color: #646a6f; padding-top: 30px; text-transform: uppercase'>Support</p></li>" +
                "<li class='sub-menu'>" +
                    "<a href='contact.html' class='active'>" +
                        "<i class='fa fa-user'></i>" +
                        "<span>Contact</span>" +
                    "</a>" +
                "</li>" +
                "<li class='sub-menu'>" +
                    "<a href='handbook.html'>" +
                        "<i class='fa fa-book'></i>" +
                        "<span>Handbook</span>" +
                    "</a>" +
                "</li>";
        }
        else if (snapshot.val() == "unofficial") {
            message.innerText = "For any feedback and concerns, we'd love to hear from you! Feel free to " +
                "send us a message below or call Ageless Alliance with the phone number listed above.";
            navigation += "" +
                "<li class='sub-menu'>" +
                    "<a href='volunteer-training.html'>" +
                        "<i class='fa fa-home'></i>" +
                        "<span>Home</span>" +
                    "</a>" +
                "</li>" +

                "<li class='sub-menu'>" +
                    "<a href='javascript:;' >" +
                        "<i class='fa fa-cogs'></i>" +
                        "<span>Account Settings</span>" +
                    "</a>" +
                    "<ul class='sub'>" +
                        "<li><a  href='account_settings.html'>Edit Account</a></li>" +
                        "<li><a  href='#0' onclick='logout()'>Logout</a></li>" +
                    "</ul>" +
                "</li>" +
                "<li><p style='color: #646a6f; padding-top: 30px; text-transform: uppercase'>Support</p></li>" +
                "<li class='sub-menu'>" +
                    "<a href='contact.html' class='active'>" +
                        "<i class='fa fa-user'></i>" +
                        "<span>Contact</span>" +
                    "</a>" +
                "</li>";
        }
        navigation_menu.innerHTML = navigation;
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}
function update_user_info(authData) {
    userRef.on("value", function(snapshot) {
        snapshot.forEach(function(data) {
            if(data.key() == authData.uid) {
                var username_instances = document.getElementsByClassName('user_name'),
                    user_email = document.getElementById('current_email'),
                    user_phone = document.getElementById('current_phone'),
                    member_date = document.getElementById('member_since'),
                    links = document.getElementById('current_links'),
                    hours = document.getElementById('total_hours');
                if (username_instances != null) {
                    for(var i = 0; i < username_instances.length; i++){
                        username_instances[i].innerText = data.val().name;
                    }
                }
                if (user_email != null) user_email.innerText = authData.password.email;
                if (user_phone != null) user_phone.innerText = data.val().phone_number;
                if (member_date != null) member_date.innerText = data.val().join_date;
                if (links != null) update_current_links();
                if (hours != null) update_total_hours();
            }
        });
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}
function update_current_links() {
    var userMatchesRef = userRef.child(authData.uid).child("matches");
    var links = document.getElementById('current_links'),
        link_string = "";
    userMatchesRef.on("value", function(snapshot) {
        snapshot.forEach(function(data) {
            if (window.location.pathname == "/user_accounts/account-official.html") {
                link_string += "" +
                    "<p><b>" + data.val().name + "</b></p>" +
                    "<h6>Please call at: " + data.val().phone_number + "</h6>";
            } else if (window.location.pathname == "/user_accounts/account_settings.html") {
                link_string += "" +
                    "<li>" +
                    "<div class='task-title'>" +
                    "<span class='task-title-sp'>Elder: <b>" + data.val().name + "</b>, " + data.val().phone_number + "</span>" +
                    "</div>" +
                "</li>";
            }
        });
        links.innerHTML = link_string;
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}
function update_total_hours() {
    var userLogEntriesRef = userRef.child(authData.uid).child("log_entries");
    var hours = document.getElementById('total_hours'),
        accumulated_hours = 0;
    userLogEntriesRef.on("value", function(snapshot) {
        snapshot.forEach(function(data) {
            accumulated_hours += parseFloat(data.val().duration);
        });
        hours.innerText = accumulated_hours;
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}

/*
    logout
 */
function logout() {
    ref.unauth();
    window.location = 'https://ageless-link.firebaseapp.com/index.html';
}

/*
    change user information
 */
function change_password() {
    var old_password = document.getElementById("old_password").value,
        new_password = document.getElementById("new_password").value,
        confirm_new_password = document.getElementById("confirm_new_password").value;
    ref.changePassword({
        email       : authData.password.email,
        oldPassword : old_password,
        newPassword : new_password
    }, function(error) {
        if (error === null) {
            console.log("Password changed successfully");
        } else {
            console.log("Error changing password:", error);
        }
    });
}
function change_email() {
    var old_email = authData.password.email.toString(),
        changed_email = document.getElementById("new_email").value,
        confirm_password = document.getElementById("email_confirm_password").value;
    var user_email = document.getElementById('current_email');
    dataRef.changeEmail({
        oldEmail : old_email,
        newEmail : changed_email,
        password : confirm_password
    }, function(error) {
        if (error === null) {
            console.log("Email changed successfully");
            //user_email.innerText = changed_email;
            update_user_info(authData);
            location.reload();
        } else {
            console.log("Error changing email:", error);
        }
    });
}
function change_phone_number() {
    var new_phone_number = document.getElementById("new_number").value,
        confirm_password = document.getElementById("email_confirm_password").value;
    var childRef = userRef.child(authData.uid);
        //elderChildRef = elderRef.child(elderData.key()).child("matches");
    childRef.update({
        "phone_number": new_phone_number
    });
    //user_phone.innerText = new_phone_number;
    update_user_info(authData);
    location.reload();
}

/*
 add new elder
 */
function add_elder() {
    var elder_first_name = document.getElementById("elder_first_name").value,
        elder_last_name = document.getElementById("elder_last_name").value,
        elder_age = document.getElementById("elder_age").value,
        senior_center = document.getElementById("elder_senior_center").value,
        person_first_name = document.getElementById("referring_first_name").value,
        person_last_name = document.getElementById("referring_last_name").value,
        person_email = document.getElementById("referring_email").value,
        person_phone = document.getElementById("referring_phone").value,
        additional_comments = "";
    if ($('#referring_comments').is(':empty'))
        additional_comments = document.getElementById("referring_comments").value;

    var elder = elder_first_name + "_" + elder_last_name;
    elderRef.child(elder).set({
        full_name: elder_first_name + " " + elder_last_name,
        age: elder_age,
        elder_reference: senior_center,
        reference_full_name: person_first_name + " " + person_last_name,
        reference_email: person_email,
        reference_phone: person_phone,
        comments: additional_comments,
        matches: ""
    });
    console.log("Successfully added elder: ", elder);
    redirect_to_login();
}

/*
    add new log entry
 */
function add_new_log_entry() {
    var date_of_contact = document.getElementById("date").value,
        date_of_contact_content = date_of_contact.innerHTML,
        duration_of_contact = document.getElementById("duration").value,
        duration_of_contact_content = duration_of_contact.innerHTML,
        elder_name = document.getElementById("elder_name").value,
        elder_name_content = elder_name.innerHTML,
        additional_comments = document.getElementById("comments").value,
        additional_comments_content = additional_comments.innerHTML,
        elder_number;
    var entriesRef = userRef.child(authData.uid).child("log_entries"),
        userMatchesRef = userRef.child(authData.uid).child("matches");
    userMatchesRef.on("value", function(snapshot) {
        snapshot.forEach(function(data) {
            if (data.val().name == elder_name) elder_number = data.val().phone_number;
        });
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
    entriesRef.push().set({
        date: date_of_contact,
        duration: duration_of_contact,
        elder: elder_name,
        comments: additional_comments,
        number: elder_number
    });
    date_of_contact.innerHTML = date_of_contact_content;
    duration_of_contact.innerHTML = duration_of_contact_content;
    elder_name.innerHTML = elder_name_content;
    additional_comments.innerHTML = additional_comments_content;
    Materialize.toast('I am a toast!', 4000);
}

/*
    matching
 */
function check_if_matched() {
    if (userData.val().volunteer_status == "official" && userData.val().matches == "") {
        console.log(userData.val().name + " needs to be matched.");
        match();
    } else if (userData.val().volunteer_status == "official" && userData.val().matches != null)
        console.log(userData.val().name + " has already been matched.");
}
function match() {
    if (elderData != null) {
        console.log("found available elder: " + elderData.val().full_name + " at number: " + elderData.val().reference_phone);
        var userMatchesRef = userRef.child(authData.uid).child("matches"),
         elderMatchesRef = elderRef.child(elderData.key()).child("matches");
        userMatchesRef.push().set({
            name : elderData.val().full_name,
            phone_number: elderData.val().reference_phone
        });
        elderMatchesRef.push().set({
            name : userData.val().name,
            phone_number: userData.val().phone_number
        });
        console.log("updated " + userData.val().name + "'s database to match " + elderData.val().full_name);

    } else {
        console.log("there are currently no available to elders to match with");
    }
}
function unmatch() {

}
function another_match() {
    match();
    update_user_info(authData);
    location.reload();
}

/*
    update elder options for new log entry
 */
function update_elder_options(user) {
    var elder_options = "",
        optionsSelect = document.getElementById('elder_name');
    var userMatchesRef = userRef.child(authData.uid).child("matches");
    userMatchesRef.on("value", function(snapshot) {
        snapshot.forEach(function(data) {
            elder_options += "<option>" + data.val().name + "</option>";
        });
        optionsSelect.innerHTML = elder_options;
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}

/*
    update log history
 */
function update_log_history(user) {
    var num = 1,
        logs = "",
        log_body = document.getElementById('log_history');
    var userLogsRef = userRef.child(authData.uid).child("log_entries");
    userLogsRef.orderByChild("date").limitToLast(100).on("value", function(snapshot) {
        snapshot.forEach(function(data) {
            if (num%2 == 1)
                logs += "<tr role='row' class='odd'><td>" + data.val().date + "</td><td>" + data.val().duration + "</td><td>" + data.val().elder + "</td><td>" + data.val().number + "</td><td>" + data.val().comments + "</td></tr>";
            else
                logs += "<tr role='row' class='even'><td>" + data.val().date + "</td><td>" + data.val().duration + "</td><td>" + data.val().elder + "</td><td>" + data.val().number + "</td><td>" + data.val().comments + "</td></tr>";
            num++;
        });
        log_body.innerHTML = logs;
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}
/*
 update most recent logs displayed on home page
 */
function update_recent_logs(user) {
    var num = 1,
        logs = "",
        log_body = document.getElementById('log_history');
    var userLogsRef = userRef.child(authData.uid).child("log_entries"),
        date = document.getElementById('last_log');
    userLogsRef.orderByChild("date").limitToLast(1).on("child_added", function(snapshot) {
        date.innerText = snapshot.val().date;
    });
    userLogsRef.orderByChild("date").limitToLast(5).on("value", function(snapshot) {
        snapshot.forEach(function(data) {
            // if (num <= 5) {
                if (num % 2 == 1)
                    logs += "<tr role='row' class='odd'><td>" + data.val().date + "</td><td>" + data.val().duration + "</td><td>" + data.val().elder + "</td><td>" + data.val().number + "</td><td>" + data.val().comments + "</td></tr>";
                else
                    logs += "<tr role='row' class='even'><td>" + data.val().date + "</td><td>" + data.val().duration + "</td><td>" + data.val().elder + "</td><td>" + data.val().number + "</td><td>" + data.val().comments + "</td></tr>";
                num++;
            // }
        });
        log_body.innerHTML = logs;
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}