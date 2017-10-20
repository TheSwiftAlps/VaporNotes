class Application {
    private usernameField;
    private passwordField;
    private loginButton;
    private createNoteButton;
    private notesDiv;
    private noteEditor;
    private titleEditor;
    private contentsEditor;
    private saveButton;
    private securityToken = null;
    private notes = null;
    private currentNote = null;
    private noteTemplate = {
        "title": "New note",
        "contents": "New note contents"
    };

    constructor() {
        this.usernameField = $('#usernameField');
        this.passwordField = $('#passwordField');
        this.loginButton = $('#loginButton');
        this.createNoteButton = $('#createNoteButton');
        this.notesDiv = $('#notesDiv');
        this.noteEditor = $('#noteEditor');
        this.titleEditor = $('#titleEditor');
        this.contentsEditor = $('#contentsEditor');
        this.saveButton = $('#saveButton');

        this.loginButton.bind('click', () => {
            this.login();
        });

        this.createNoteButton.bind('click', () => {
            this.createNote();
        });

        this.saveButton.bind('click', () => {
            this.saveCurrentNote();
        });
    }

    public login(): void {
        $.ajax({
            type: "POST",
            url: "/api/v1/login",
            contentType: "application/json; charset=utf-8",
            beforeSend: (xhr) => {
                let token = btoa(this.usernameField.val() + ":" + this.passwordField.val());
                xhr.setRequestHeader ("Authorization", "Basic " + token);
            },
            success: (data) => {
                this.securityToken = data["token"];
                this.getNotes();
                this.usernameField.attr("disabled", "disabled");
                this.passwordField.attr("disabled", "disabled");
                this.createNoteButton.removeAttr("disabled");
                this.loginButton.val("logout");
                this.loginButton.unbind('click');
                this.loginButton.bind('click', () => {
                    this.logout();
                });
            },
            error: () => {
                alert("Wrong credentials");
            },
        });
    }

    public logout(): void {
        this.notesDiv.empty();
        this.securityToken = null;
        this.usernameField.removeAttr("disabled");
        this.passwordField.removeAttr("disabled");
        this.createNoteButton.attr("disabled", "disabled");
        this.loginButton.val("login");
        this.loginButton.unbind('click');
        this.loginButton.bind('click', () => {
            this.login();
        });
    }

    public createNote(): void {
        if (this.securityToken !== null) {
            this.disableEditor();
            $.ajax({
                type: "POST",
                url: "/api/v1/notes",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(this.noteTemplate),
                beforeSend: (xhr) => {
                    xhr.setRequestHeader ("Authorization", "Bearer " + this.securityToken);
                },
                success: () => {
                    this.getNotes();
                },
            });
        }
        else {
            alert("Please login first");
        }
    }

    public getNotes(): void {
        if (this.securityToken !== null) {
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                url: "/api/v1/notes",
                beforeSend: (xhr) => {
                    xhr.setRequestHeader ("Authorization", "Bearer " + this.securityToken);
                },
                success: (data) => {
                    this.notes = data["data"];
                    this.displayNotes();
                },
            });
        }
        else {
            alert("Please login first");
        }
    }

    public deleteNote(id): void {
        if (this.securityToken !== null) {
            this.disableEditor();
            $.ajax({
                type: "DELETE",
                contentType: "application/json; charset=utf-8",
                url: "/api/v1/notes/" + id,
                beforeSend: (xhr) => {
                    xhr.setRequestHeader ("Authorization", "Bearer " + this.securityToken);
                },
                success: () => {
                    this.getNotes();
                },
            });
        }
        else {
            alert("Please login first");
        }
    }

    public viewNote(note): void {
        this.enableEditor();
        this.currentNote = note;
        this.titleEditor.val(note.title);
        this.contentsEditor.val(note.contents);
    }

    public enableEditor(): void {
        this.noteEditor.show();
        this.saveButton.removeAttr("disabled");
        this.titleEditor.removeAttr("disabled");
        this.contentsEditor.removeAttr("disabled");
    }

    public disableEditor(): void {
        this.noteEditor.hide();
        this.saveButton.attr("disabled", "disabled");
        this.titleEditor.attr("disabled", "disabled");
        this.contentsEditor.attr("disabled", "disabled");
        this.titleEditor.val("");
        this.contentsEditor.val("");
        this.currentNote = null;
    }

    public saveCurrentNote(): void {
        if (this.securityToken !== null && this.currentNote !== null) {
            let data = {
                "title": this.titleEditor.val(),
                "contents": this.contentsEditor.val()
            };
            $.ajax({
                type: "PUT",
                contentType: "application/json; charset=utf-8",
                url: "/api/v1/notes/" + this.currentNote.id,
                data: JSON.stringify(data),
                beforeSend: (xhr) => {
                    xhr.setRequestHeader ("Authorization", "Bearer " + this.securityToken);
                },
                success: () => {
                    this.getNotes();
                },
            });
        }
    }

    public publishNote(id): void {
        if (this.securityToken !== null) {
            $.ajax({
                type: "PUT",
                contentType: "application/json; charset=utf-8",
                url: "/api/v1/notes/" + id + "/publish",
                beforeSend: (xhr) => {
                    xhr.setRequestHeader ("Authorization", "Bearer " + this.securityToken);
                },
                success: () => {
                    this.getNotes();
                },
            });
        }
    }

    public unpublishNote(id): void {
        if (this.securityToken !== null) {
            $.ajax({
                type: "PUT",
                contentType: "application/json; charset=utf-8",
                url: "/api/v1/notes/" + id + "/unpublish",
                beforeSend: (xhr) => {
                    xhr.setRequestHeader ("Authorization", "Bearer " + this.securityToken);
                },
                success: () => {
                    this.getNotes();
                },
            });
        }
    }

    public displayNotes(): void {
        this.notesDiv.empty();
        for (let note of this.notes) {
            let p = $("<p>");
            let editButton = $('<input type="button" value="edit">');
            editButton.bind('click', () => {
                this.viewNote(note);
            });
            let deleteButton = $('<input type="button" value="delete">');
            deleteButton.bind('click', () => {
                this.deleteNote(note.id);
            });
            p.append(editButton);
            p.append("&nbsp;");
            if (note.published) {
                let a = $('<a target="_blank" href="/' + note.slug + '">' + note.title + '</a>');
                let unpublishButton = $('<input type="button" value="unpublish">');
                unpublishButton.bind('click', () => {
                    this.unpublishNote(note.id);
                });
                p.append(a);
                p.append("&nbsp;");
                p.append(unpublishButton);
            }
            else {
                p.append(note.title);
                let publishButton = $('<input type="button" value="publish">');
                publishButton.bind('click', () => {
                    this.publishNote(note.id);
                });
                p.append("&nbsp;");
                p.append(publishButton);
            }
            p.append("&nbsp;");
            p.append(deleteButton);
            this.notesDiv.append(p);
        }
    }
}

let app;

$(function () {
    app = new Application();
});
