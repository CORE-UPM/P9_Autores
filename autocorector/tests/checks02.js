/* eslint-disable no-invalid-this*/
/* eslint-disable no-undef*/
const path = require("path");
const {has_failed,checkFileExists,create_browser,from_env,DEBUG,ROOT,path_assignment, warn_errors, scored} = require("../utils/testutils");
const fs = require("fs");
const net = require('net');
const spawn = require("child_process").spawn;
const util = require('util');
const exec = util.promisify(require("child_process").exec);
const Sequelize = require('sequelize');

const PATH_ASSIGNMENT = path_assignment("blog");
const TIMEOUT =  parseInt(from_env("TIMEOUT", 6000));
const TEST_PORT =  parseInt(from_env("TEST_PORT", "3001"));

let browser = create_browser();

var server;


describe("Tests Práctica 9", function() {
    after(function () {
        warn_errors();
    });

    describe("Prechecks", function () {
	      scored(`Comprobando que existe la carpeta de la entrega: ${PATH_ASSIGNMENT}`,
               -1,
               async function () {
                   this.msg_err = `No se encontró la carpeta '${PATH_ASSIGNMENT}'`;
                   (await checkFileExists(PATH_ASSIGNMENT)).should.be.equal(true);
	             });

        scored(`Comprobar que se han añadido plantillas express-partials`, -1, async function () {
            this.msg_ok = 'Se incluye layout.ejs';
            this.msg_err = 'No se ha encontrado views/layout.ejs';
            fs.existsSync(path.join(PATH_ASSIGNMENT, "views", "layout.ejs")).should.be.equal(true);
        });


        scored(`Comprobar que las plantillas express-partials tienen los componentes adecuados`, -1, async function () {
            this.msg_ok = 'Se incluyen todos los elementos necesarios en la plantilla';
            this.msg_err = 'No se ha encontrado todos los elementos necesarios';
            let checks = {
                "layout.ejs": {
                    true: [/<%- body %>/g, /<header/, /<\/header>/, /<nav/, /<\/nav/, /<main/, /<\/main/, /<footer/, /<\/footer>/]
                },
                "index.ejs": {
                    true: [/<h1/, /<\/h1>/],
                    false: [/<body/, /<\/body>/, /<html/, /<\/html>/, /<nav/, /<\/nav>/]
                },
                [path.join("posts", "index.ejs")]: {
                    true: [/<section/, /<\/section>/, /<article/, /<\/article>/],
                    false: [/<body/, /<\/body>/, /<html/, /<\/html>/, /<nav/, /<\/nav>/]
                },
                [path.join("posts", "show.ejs")]: {
                    true: [/<article/, /<\/article>/],
                    false: [/<body/, /<\/body>/, /<html/, /<\/html>/, /<nav/, /<\/nav>/]
                },
                [path.join("posts", "new.ejs")]: {
                    true: [/<form/, /<\/form>/, /include/, /_form\.ejs/],
                    false: [/<body/, /<\/body>/, /<html/, /<\/html>/, /<nav/, /<\/nav>/]
                },
                [path.join("posts", "edit.ejs")]: {
                    true: [/<form/, /<\/form>/, /include/, /_form\.ejs/],
                    false: [/<body/, /<\/body>/, /<html/, /<\/html>/, /<nav/, /<\/nav>/]
                },
                [path.join("posts", "_form.ejs")]: {
                    false: [/<body/, /<\/body>/, /<html/, /<\/html>/, /<nav/, /<\/nav>/]
                },
                [path.join("attachments", "_attachment.ejs")]: {
                    true: [/<img/, /\/images\/none.png/],
                    false: [/<body/, /<\/body>/, /<html/, /<\/html>/, /<nav/, /<\/nav>/]
                },
                [path.join("users", "index.ejs")]: {
                    false: [/<body/, /<\/body>/, /<html/, /<\/html>/, /<nav/, /<\/nav>/]
                },
                [path.join("users", "show.ejs")]: {
                    false: [/<body/, /<\/body>/, /<html/, /<\/html>/, /<nav/, /<\/nav>/]
                },
                [path.join("users", "new.ejs")]: {
                    true: [/<form/, /<\/form>/, /include/, /_form\.ejs/],
                    false: [/<body/, /<\/body>/, /<html/, /<\/html>/, /<nav/, /<\/nav>/]
                },
                [path.join("users", "edit.ejs")]: {
                    true: [/<form/, /<\/form>/, /include/, /_form\.ejs/],
                    false: [/<body/, /<\/body>/, /<html/, /<\/html>/, /<nav/, /<\/nav>/]
                },
                [path.join("users", "_form.ejs")]: {
                    false: [/<body/, /<\/body>/, /<html/, /<\/html>/, /<nav/, /<\/nav>/]
                },
                [path.join("session", "new.ejs")]: {
                    true: [/<form/, /<\/form>/],
                    false: [/<body/, /<\/body>/, /<html/, /<\/html>/, /<nav/, /<\/nav>/]
                }
            }

            for (fpath in checks) {
                this.msg_err = `No se encuentra el fichero ${fpath}`;
                let templ = fs.readFileSync(path.join(PATH_ASSIGNMENT, "views", fpath), "utf8");
                for(status in checks[fpath]) {
                    elements = checks[fpath][status];
                    for(var elem in elements){
                        const shouldbe = (status == 'true');
                        let e = elements[elem];
                        if (shouldbe) {
                            this.msg_err = `${fpath} no incluye ${e}`;
                        } else {
                            this.msg_err = `${fpath} incluye ${e}, pero debería haberse borrado`;
                        }
                        e.test(templ).should.be.equal(shouldbe);
                    }
                }
            }
        });

        scored(`Comprobar que la migración y el seeder para Usuarios existen (P7)`, -1, async function () {
            this.msg_ok = 'Se incluye la migración y el seeder';

            this.msg_err = `No se ha encontrado la migración que crea la tabla Posts`;
            let mig = fs.readdirSync(path.join(PATH_ASSIGNMENT, "migrations")).filter(fn => fn.endsWith('-CreatePostsTable.js'));
            (mig.length).should.be.equal(1);

            this.msg_err = `No se ha encontrado la migración que crea la tabla Attachments`;
            mig = fs.readdirSync(path.join(PATH_ASSIGNMENT, "migrations")).filter(fn => fn.endsWith('-CreateAttachmentsTable.js'));
            (mig.length).should.be.equal(1);

            this.msg_err = `No se ha encontrado la migración que crea la tabla Users`;
            mig = fs.readdirSync(path.join(PATH_ASSIGNMENT, "migrations")).filter(fn => fn.endsWith('-CreateUsersTable.js'));
            (mig.length).should.be.equal(1);

            this.msg_err = `La migración no incluye el campo email`;
            debug(mig[0]);
            let templ = fs.readFileSync(path.join(PATH_ASSIGNMENT, "migrations", mig[0]));
            /email/.test(templ).should.be.equal(true);


            this.msg_err = `No se ha encontrado la migración que añade el campo authorId a la tabla Post`;
            mig = fs.readdirSync(path.join(PATH_ASSIGNMENT, "migrations")).filter(fn => fn.endsWith('-AddAuthorIdToPostsTable.js'));
            (mig.length).should.be.equal(1);
            this.msg_err = `La migración no incluye el campo authorId`;
            debug(mig[0]);
            templ = fs.readFileSync(path.join(PATH_ASSIGNMENT, "migrations", mig[0]));
            /authorId/.test(templ).should.be.equal(true);

            let seed = fs.readdirSync(path.join(PATH_ASSIGNMENT, "seeders")).filter(fn => fn.endsWith('-FillUsersTable.js'));
            this.msg_err = 'No se ha encontrado el seeder';
            (seed.length).should.be.equal(1);
        });

        scored(`Comprobar que los controladores existen`, -1, async function () {
            this.msg_ok = 'Se incluyen los controladores de posts, usuarios y sesiones';

            this.msg_err = "No se incluye el controlador de post";
            await checkFileExists(path.resolve(path.join(PATH_ASSIGNMENT, 'controllers', 'post')));

            let postCtrl = require(path.resolve(path.join(PATH_ASSIGNMENT, 'controllers', 'post')));
            for (let mw of ["load", "index", "show", "new", "create", "edit", "update", "destroy", "attachment" ]) {
                this.msg_err = `Falta el middleware ${mw} en el controlador de los posts`;
                postCtrl[mw].should.not.be.undefined;
            }

            this.msg_err = "No se incluye el controlador de usuarios";
            await checkFileExists(path.resolve(path.join(PATH_ASSIGNMENT, 'controllers', 'user')));

            const userCtrl = require(path.resolve(path.join(PATH_ASSIGNMENT, 'controllers', 'user')));
            for (let mw of ["load", "index", "show", "new", "create", "edit", "update", "destroy"]) {
                this.msg_err = `Falta el middleware ${mw} en el controlador de los usuarios`;
                userCtrl[mw].should.not.be.undefined;
            }

            this.msg_err = "No se incluye el controlador de sesiones";
            await checkFileExists(path.resolve(path.join(PATH_ASSIGNMENT, 'controllers', 'session')));

            const sessionCtrl = require(path.resolve(path.join(PATH_ASSIGNMENT, 'controllers', 'session')));
            for (let mw of ["new", "create", "destroy"]) {
                this.msg_err = `Falta el middleware ${mw} en el controlador de las sesiones`;
                sessionCtrl[mw].should.not.be.undefined;
            }
        });

        scored(`Comprobar que se ha añadido el código para incluir los comandos adecuados (P6)`, -1, async function () {
            let rawdata = fs.readFileSync(path.join(PATH_ASSIGNMENT, 'package.json'));
            let pack = JSON.parse(rawdata);
            this.msg_ok = 'Se incluyen todos los scripts/comandos';
            this.msg_err = 'No se han encontrado todos los scripts';
            scripts = {
                "super": "supervisor ./bin/www",
                "migrate": "sequelize db:migrate",
                "seed": "sequelize db:seed:all",
            };
            for(script in scripts){
                this.msg_err = `Falta el comando para ${script}`;
                pack.scripts[script].should.be.equal(scripts[script]);
            }
        });

    });

    describe("Tests funcionales", function () {
        let server;
        let sequelize;

        const databaseConfigPath = path.resolve(path.join(__dirname, "..", "config", "config.json"));
        process.env.DATABASE_CONFIG_PATH = databaseConfigPath;

        const db_filename = 'autocorector.sqlite';
        const db_file = path.resolve(path.join(ROOT, db_filename));

        const users = [
            {id: 1, username: "admin", email: "admin@core.example", password: "1234"},
            {id: 2, username: "pepe", email: "pepe@core.example", password: "5678"},
        ];

        before(async function() {
            if(has_failed()){
                return;
            }
            // Crear base de datos nueva y poblarla antes de los tests funcionales. por defecto, el servidor coge post.sqlite del CWD
            try {
                fs.unlinkSync(db_file);
                debug('Previous test db removed. A new one is going to be created.')
            } catch {
                debug('Previous test db does not exist. A new one is going to be created.')
            }
            fs.closeSync(fs.openSync(db_file, 'w'));

            sequelize = new Sequelize(require(databaseConfigPath));


            let sequelize_cmd = path.join(PATH_ASSIGNMENT, "node_modules", ".bin", "sequelize")
            await exec(`${sequelize_cmd} db:migrate --config "${databaseConfigPath}" --migrations-path ${path.join(PATH_ASSIGNMENT, "migrations")}`);
            debug('Lanzada la migración');
            await exec(`${sequelize_cmd} db:seed:all --config "${databaseConfigPath}" --seeders-path ${path.join(PATH_ASSIGNMENT, "seeders")}`);
            debug('Lanzado el seeder');


            let bin_path = path.join(PATH_ASSIGNMENT, "bin", "www");
            server = spawn('node', [bin_path], {
                env: {
                    DEBUG: DEBUG,
                    PORT: TEST_PORT,
                    PATH: process.env.PATH,
                    DATABASE_CONFIG_PATH: databaseConfigPath
                }
            });
            server.stdout.setEncoding('utf-8');
            server.stdout.on('data', function(data) {
                debug('Salida del servidor: ', data);
            });
            server.stderr.on('data', function (data) {
                debug('EL SERVIDOR HA DADO UN ERROR. SALIDA stderr: ' + data);
            });
            console.log(`Lanzado el servidor en el puerto ${TEST_PORT}`);
            await new Promise(resolve => setTimeout(resolve, TIMEOUT));
            browser.site = `http://127.0.0.1:${TEST_PORT}/`;
            try{
                await browser.visit("/");
                browser.assert.status(200);
            }catch(e){
                console.log("No se ha podido contactar con el servidor.");
                throw(e);
            }
        });

        after(async function() {
            // Borrar base de datos

            if(typeof server !== 'undefined') {
                await server.kill();
                function sleep(ms) {
                    return new Promise((resolve) => {
                        setTimeout(resolve, ms);
                    });
                }
                //wait for 1 second for the server to release the sqlite file
                await sleep(1000);
            }

            try {
                fs.unlinkSync(db_file);
            } catch(e){
                debug("Test db not removed.");
                debug(e);
            }
        });

        scored(`Si hay un usuario logueado y crea un post, entonces el campo **authorId** del post debe ser igual al **id** del usuario logueado.`, 2.0, async function() {

            for(user of users) {
                await browser.visit(`/login?_method=DELETE`);
                await browser.visit(`/login`);
                this.msg_err = `No se ha podido hacer login con ${user.username} y ${user.password}`;

                browser.assert.status(200)
                await browser.fill('#username', user.username);
                await browser.fill('#password', user.password);
                await browser.pressButton('form input[type="submit"]');
                // It should not redirect to the login page
                debug(browser.location.href);
                browser.location.href.includes("login").should.be.equal(false);


                this.msg_err = 'No se muestra la página de creación de posts';

                await browser.visit("/posts/new");
                browser.assert.status(200);

                this.msg_err = 'No se puede crear un nuevo post';
                browser.assert.element('#title');
                browser.assert.element('#body');
                browser.assert.element('form input[type="submit"]');
                const title = `Titulo con usuario ${user.username} raw`;
                const body = `Cuerpo con usuario ${user.username} raw`;
                await browser.fill('#title', title);
                await browser.fill('#body', body);
                await browser.pressButton('form input[type="submit"]');
                browser.assert.status(200);

                this.msg_err = `No se encuentra el post creado en la base de datos`;

                const [res, metadata] = await sequelize.query(`SELECT * from Posts where title = ? and body = ?`, {
                    logging: DEBUG,
                    raw: true,
                    replacements: [title, body],
                });
                debug(res);
                (res.length).should.be.equal(1);
                this.msg_err = `La nuevo post no tiene el campo authorId adecuado (Se espera ${user.id}, se obtiene ${res[0].authorId})`;
                res[0].authorId.should.be.equal(user.id);
            }
        });

        scored(`Si no hay un usuario logueado y se crea un post, entonces el campo **authorId** del post debe estar vacío.`, 1.5, async function() {
            await browser.visit(`/login?_method=DELETE`);
            this.msg_err = 'No se muestra la página de creación de posts';

            await browser.visit("/posts/new");
            browser.assert.status(200);

            this.msg_err = 'No se puede crear un nuevo post';
            browser.assert.element('#title');
            browser.assert.element('#body');
            browser.assert.element('form input[type="submit"]');
            const title = 'Post con usuario anónimo';
            const body = 'Cuerpo con usuario anónimo';
            await browser.fill('#title', title);
            await browser.fill('#body', body);
            await browser.pressButton('form input[type="submit"]');
            browser.assert.status(200);

            this.msg_err = `No se encuentra el post creado en la base de datos`;

            const [res, metadata] = await sequelize.query(`SELECT * from Posts where title = ? and body = ?`, {
                logging: DEBUG,
                raw: true,
                replacements: [title, body],
            });
            debug(res);
            (res.length).should.be.equal(1);
            this.msg_err = `La nuevo post no tiene el campo authorId en blanco (Se obtuvo ${res[0].authorId})`;
            should.not.exist(res[0].authorId);
        });

        scored(`Si un post tiene autor, entonces la vista **show** de ese post debe mostrar el nombre del autor.`, 2.0, async function() {
            for(user of users) {
                await browser.visit(`/login?_method=DELETE`);
                await browser.visit(`/login`);
                this.msg_err = `No se ha podido hacer login con ${user.username} y ${user.password}`;

                browser.assert.status(200)
                await browser.fill('#username', user.username);
                await browser.fill('#password', user.password);
                await browser.pressButton('form input[type="submit"]');
                // It should not redirect to the login page
                debug(browser.location.href);
                browser.location.href.includes("login").should.be.equal(false);


                this.msg_err = 'No se muestra la página de creación de posts';

                await browser.visit("/posts/new");
                browser.assert.status(200);

                this.msg_err = 'No se puede crear un nuevo post';
                browser.assert.element('#title');
                browser.assert.element('#body');
                browser.assert.element('form input[type="submit"]');
                await browser.fill('#title','Post con usuario');
                await browser.fill('#body', 'Cuerpo con usuario');
                await browser.pressButton('form input[type="submit"]');
                browser.assert.status(200);

                this.msg_err = `La página de visualización del nuevo post no muestra el nombre del autor correcto`;
                debug("POST CREADO. URL devuelta: " + browser.location.href);
                browser.location.href.includes('/posts/').should.be.equal(true);
                debug(browser.html());
                browser.assert.element('#author');
                browser.html().includes(user.username).should.be.equal(true);
            }
        });

        scored(`Si un post no tiene autor, entonces la vista **show** de ese post debe mostrar el texto **Anonymous** como nombre del autor.`, 1.5, async function() {
                await browser.visit(`/login?_method=DELETE`);
                await browser.visit(`/login`);

                await browser.visit("/posts/new");
                browser.assert.status(200);

                this.msg_err = 'No se puede crear un nuevo post';
                browser.assert.element('#title');
                browser.assert.element('#body');
                browser.assert.element('form input[type="submit"]');
                await browser.fill('#title','Post con usuario anónimo');
                await browser.fill('#body', 'Cuerpo con usuario anónimo');
                await browser.pressButton('form input[type="submit"]');
                browser.assert.status(200);

                this.msg_err = `La página de visualización del nuevo post no muestra el nombre del autor correcto`;
                debug("POST CREADO. URL devuelta: " + browser.location.href);
                browser.location.href.includes('/posts/').should.be.equal(true);
                debug(browser.html());
                browser.assert.element('#author');
                browser.html().includes("Anonymous").should.be.equal(true);
        });

        scored(`La vista **index** debe mostrar el nombre del autor o el texto **Anonymous** para todos los posts listados.`, 3.0, async function() {
            await browser.visit("/posts/");

            for(const el of browser.queryAll('.author')) {
                debug(el.innerHTML);
                // The author should be one of the seeder values or anonymous
                /pepe|admin|Anonymous/.test(el.innerHTML).should.be.equal(true);
            }
        });
    });

})
