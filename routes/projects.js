var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

//Any requests to this controller must pass through this 'use' function
//Copy and pasted from method-override
router.use(bodyParser.urlencoded({extended: true}))
router.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}))

router.route('/archive')
    .get(function (req, res, next) {
        if (redirectIfNotLoggedIn(req, res)) return;

        const uid = req.session.uid.toString();

        mongoose.model('User').findById(uid, function (err, user) {
            if (err) {
                return console.error(err);
            } else {
                mongoose.model('Project').find( {
                        archived: true,
                        $or: [
                            { author: uid },
                            {"members" : { '$regex' : user.username, '$options' : 'i' }}
                        ]
                    }, function (err, projects) {
                        if (err) {
                            return console.error(err);
                        } else {
                            res.format({
                                html: function () {
                                    res.render('projects/archive', {
                                        title: 'My Archived Projects',
                                        "projects": projects
                                    });
                                },
                                json: function () {
                                    res.json(projects);
                                }
                            });
                        }
                    });
            }
        });
    })

router.route('/my')
    .get(function (req, res, next) {
        if (redirectIfNotLoggedIn(req, res)) return;

        const uid = req.session.uid.toString();

        mongoose.model('User').findById(uid, function (err, user) {
            if (err) {
                return console.error(err);
            } else {
                mongoose.model('Project').find({author: uid}, function (err, leaderProjects) {
                    if (err) {
                        return console.error(err);
                    } else {
                        mongoose.model('Project').find({"members" : { '$regex' : user.username, '$options' : 'i' }}, function (err, memberProjects) {
                            if (err) {
                                return console.error(err);
                            } else {
                                res.format({
                                    html: function () {
                                        res.render('projects/my', {
                                            title: 'My Projects',
                                            "leaderProjects": leaderProjects,
                                            "memberProjects": memberProjects,
                                        });
                                    },
                                    json: function () {
                                        res.json(leaderProjects);
                                        res.json(memberProjects);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

router.route('/delete/:id')
    .delete(function (req, res) {
        if (redirectIfNotLoggedIn(req, res)) return;

        mongoose.model('Project').findById(req.params.id, function (err, project) {
            if (err) {
                return console.error(err);
            } else {
                project.remove(function (err, project) {
                    if (err) {
                        return console.error(err);
                    } else {
                        console.log('DELETE removing ID: ' + project._id);
                        res.format({
                            html: function () {
                                res.redirect("/projects/my");
                            },
                            json: function () {
                                res.json({
                                    message: 'deleted',
                                    item: project
                                });
                            }
                        });
                    }
                });
            }
        });
    });

router.route('/')
    .get(function (req, res, next) {
        if (redirectIfNotLoggedIn(req, res)) return;

        mongoose.model('Project').find({}, function (err, projects) {
            if (err) {
                return console.error(err);
            } else {
                mongoose.model('User').find({}, function (err, users) {
                    if (err) {
                        return console.error(err);
                    } else {
                        for (project of projects) {
                            for (user of users) {
                                if (project.author.toString() == user._id.toString()) {
                                    project.authorName = user.username;
                                    break;
                                }
                            }
                        }

                        res.format({
                            html: function () {
                                res.render('projects/index', {
                                    title: 'Projects',
                                    "projects": projects
                                });
                            },
                            json: function () {
                                res.json(projects);
                            }
                        });
                    }
                });
            }
        });
    })
    .post(function (req, res) {
        if (redirectIfNotLoggedIn(req, res)) return;

        const name = req.body.name;
        const description = req.body.description;
        const price = req.body.price;
        const _members = req.param('member');
        let members;
        if (typeof _members === 'undefined') {
            members = ""
        } else {
            members = _members.toString();
        }
        const finishedWorks = req.body.finishedWorks;
        const startTime = req.body.startTime;
        const endTime = req.body.endTime;
        const archived = req.body.archived === "on";
        const author = req.session.uid;

        mongoose.model('Project').create({
            name: name,
            description: description,
            price: price,
            members: members,
            finishedWorks: finishedWorks,
            startTime: startTime,
            endTime: endTime,
            archived: archived,
            author: author,
        }, function (err, project) {
            if (err) {
                res.send("There was a problem adding the information to the database.");
            } else {
                console.log('POST creating new project: ' + project);
                res.format({
                    html: function () {
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("projects");
                        // And forward to success page
                        res.redirect("/projects");
                    },
                    json: function () {
                        res.json(project);
                    }
                });
            }
        })
    });

router.get('/new', function (req, res) {
    if (redirectIfNotLoggedIn(req, res)) return;

    const uid = req.session.uid.toString();

    mongoose.model('User').find({_id: { $ne: uid}}, function (err, users) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            res.render('projects/new', {
                title: 'New Project',
                users: users,
            });
        }
    });
});

router.route('/:id')
    .get(function (req, res) {
        if (redirectIfNotLoggedIn(req, res)) return;

        const uid = req.session.uid.toString();

        mongoose.model('User').findById(uid, function (err, user) {
            if (err) {
                return console.error(err);
            } else {
                mongoose.model('Project').findById(req.params.id, function (err, project) {
                    if (err) {
                        console.log('GET Error: There was a problem retrieving: ' + err);
                    } else {
                        res.format({
                            html: function () {
                                res.render('projects/show', {
                                    "project": project,
                                    "author": user.username,
                                    "title": "Details",
                                });
                            },
                            json: function () {
                                res.json(project);
                            }
                        });
                    }
                });
            }
        });
    });

router.route('/edit/:id')
    .get(function (req, res) {
        if (redirectIfNotLoggedIn(req, res)) return;

        const uid = req.session.uid.toString();

        mongoose.model('User').find({_id: { $ne: uid}}, function (err, users) {
            if (err) {
                console.log('GET Error: There was a problem retrieving: ' + err);
            } else {
                mongoose.model('Project').findById(req.params.id, function (err, project) {
                    if (err) {
                        console.log('GET Error: There was a problem retrieving: ' + err);
                    } else {
                        for (user of users) {
                            const members = project.members;
                            if (members === "" || members === null) {
                                user.checked = false;
                            } else {
                                user.checked = members.includes(user.username);
                            }
                        }

                        res.format({
                            html: function () {
                                res.render('projects/edit', {
                                    title: 'Project: ' + project._id,
                                    "project": project,
                                    "users": users,
                                    "title": "Edit",
                                });
                            },
                            json: function () {
                                res.json(project);
                                res.json(users);
                            }
                        });
                    }
                });
            }
        });
    })
    .put(function (req, res) {
        if (redirectIfNotLoggedIn(req, res)) return;

        const name = req.body.name;
        const description = req.body.description;
        const price = req.body.price;
        const _members = req.param('member');
        let members;
        if (typeof _members === 'undefined') {
            members = ""
        } else {
            members = _members.toString();
        }
        const finishedWorks = req.body.finishedWorks;
        const startTime = req.body.startTime;
        const endTime = req.body.endTime;
        const archived = req.body.archived === "on";

        mongoose.model('Project').findById(req.params.id, function (err, project) {
            project.update({
                name: name,
                description: description,
                price: price,
                members: members,
                finishedWorks: finishedWorks,
                startTime: startTime,
                endTime: endTime,
                archived: archived,
            }, function (err, projectId) {
                if (err) {
                    res.send("There was a problem updating the information to the database: " + err);
                } else {
                    res.format({
                        html: function () {
                            res.redirect("/projects/my");
                        }
                    });
                }
            })
        });
    });

router.route('/editMember/:id')
    .get(function (req, res) {
        if (redirectIfNotLoggedIn(req, res)) return;

        const uid = req.session.uid.toString();

        mongoose.model('User').find({_id: { $ne: uid}}, function (err, users) {
            if (err) {
                console.log('GET Error: There was a problem retrieving: ' + err);
            } else {
                mongoose.model('Project').findById(req.params.id, function (err, project) {
                    if (err) {
                        console.log('GET Error: There was a problem retrieving: ' + err);
                    } else {
                        for (user of users) {
                            const members = project.members;
                            if (members === "" || members === null) {
                                user.checked = false;
                            } else {
                                user.checked = members.includes(user.username);
                            }
                        }

                        res.format({
                            html: function () {
                                res.render('projects/edit_member', {
                                    title: 'Project: ' + project._id,
                                    "project": project,
                                    "users": users,
                                    "title": "Edit",
                                });
                            },
                            json: function () {
                                res.json(project);
                                res.json(users);
                            }
                        });
                    }
                });
            }
        });
    })
    .put(function (req, res) {
        if (redirectIfNotLoggedIn(req, res)) return;

        const finishedWorks = req.body.finishedWorks;

        mongoose.model('Project').findById(req.params.id, function (err, project) {
            project.update({
                finishedWorks: finishedWorks,
            }, function (err, projectId) {
                if (err) {
                    res.send("There was a problem updating the information to the database: " + err);
                } else {
                    res.format({
                        html: function () {
                            res.redirect("/projects/my");
                        }
                    });
                }
            })
        });
    });

function redirectIfNotLoggedIn(req, res) {
    if (!req.session.uid) {
        res.redirect('/login');
        return true;
    }
    return false;
}

module.exports = router;