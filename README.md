
# Práctica 8: Autores

Versión: 26 de Abril de 2022

## Objetivos

* Afianzar los conocimientos obtenidos sobre el uso de Express para desarrollar servidores web.
* Aprender a manejar relaciones entre los modelos de la BBDD.

## Descripción de la práctica

En esta práctica 8 se ampliará la **Práctica 7 Autenticación** para poder registrar que usuario ha sido el autor de cada post.

Para ello se modificará la tabla **Posts** de la BBDD añadiendo un nuevo campo llamado **authorId**.
En este campo se guardará el **id** del usuario que ha creado el post, que es el usuario que ha realizado login. 
Si el usuario que crea el post no se ha logueado, entonces no se guardará ningún valor en el campo **authorId**.

El desarrollo pedido en esta práctica es prácticamente igual al realizado en el mini proyecto **Autores** visto
en las clases teóricas de la asignatura.
En el mini proyecto **Autores** se registraba quién era el autor de los quizzes creados, 
y en esta práctica se registrará quién es el autor de los posts creados.

## Descargar el código del proyecto

Es necesario utilizar la **versión 16 de Node.js** para el desarrollo de esta práctica.
El proyecto debe clonarse en el ordenador en el que se está trabajando:

    $ git clone https://github.com/CORE-UPM/P8_Autores

A continuación se debe acceder al directorio de trabajo, e instalar todas las dependencias propias de esta práctica.

    $ cd P8_Autores
    $ npm install

## Tareas

### Tarea 1 - Copiar el trabajo ya realizado en la Entrega 7 Autenticación

En esta práctica hay que continuar y ampliar el desarrollo realizado en la práctica 7.

El alumno debe copiar el directorio **blog** de la **P7_autenticacion** en el directorio **P8_Autores/blog** de
esta práctica 8. Las tareas a realizar en esta práctica 8 de desarrollarán dentro del directorio **P8_Autores/blog**.

Para copiar/duplicar el directorio **P7_autenticacion/blog** en el directorio **P8_Autores/blog**, puede usar un
explorador de archivos. Asegúrese de copiar el directorio y no de moverlo de sitio, para no perder el trabajo original.
También puede ejecutar el siguiente comando en un terminal unix para copiar el directorio y todo su contenido:

    $ cp -r PATH_DE_PRACTICA_7/P7_autenticacion/blog PATH_DE_PRACTICA_8/P8_Autores/.

### Tarea 2 - Definir la relación 1-a-N entre los modelos

Hay que definir una relación entre los modelos **User** y **Post** para indicar que cada post tiene un 
usuario como autor, y que un usuario puede ser el autor de muchos posts. Esta es una relación 1-a-N.

El alumno tiene que definir esta relación en el fichero **models/index.js** 
y cumplir con los siguientes requisitos:

* La clave externa usada para definir esta relación debe llamarse **authorId**.
* Use el nombre **"posts"** como alias al indicar que un usuario tiene muchos posts de los que es el autor.
* Use el nombre **"author"** como alias al indicar que un post pertenece al usuario que ha sido su autor.

El alumno también tiene que crear una migración en un fichero con nombre **migrations/YYYYMMDDhhmmss-AddAuthorIdToPostsTabl
e.js**.
Esta migración debe modificar la tabla **Posts** de la BBDD añadiendo el campo **authorId**.


### Tarea 3 - Asignar el autor al crear un post.

Si hay un usuario logueado, éste será el autor de los posts que cree.
En este caso se guardará el valor del campo **id** del usuario, en el campo **authorId** de cada post creado.

Si no hay usuario logueado, no puede saberse quién es el autor de los posts creados.
En este caso se dejara vacio el campo **authorId** de los posts creados.

El alumno debe adaptar el middleware **create** del controlador de los posts para ver si hay un usuario logueado o no, 
y asignar el valor adecuado al campo **authorId** del post que está creando.


### Tarea 4 - Mostrar el nombre del autor en las vistas de los posts.

En esta tarea el alumno debe modificar las vistas **views/posts/show.ejs** y 
**views/posts/index.ejs** para presentar el **nombre del autor** (`username`) de cada post mostrado.
Si algún post no tiene autor, debe mostrarse el texto **Anonymous** en vez del nombre del autor.
Para mostrar el nombre, se puede utilizar cualquier etiqueta HTML, pero se debe utilizar el id **author** en el caso del formulario (**views/posts/show.ejs**), y la clase **author** en el caso del índice de posts (**views/posts/index.ejs**).

Cuando se renderizan las vistas anteriores, el autor de cada post debe estar accesible en la propiedad **author** de los objetos **Post** sacados de la base de datos. 
Para ello se debe realizar una carga ansiosa de los autores al recuperar los posts de la BBDD.
El alumno debe usar la opción **include** para cargar los autores de los posts en las llamadas a **findByPk** y a **findAll** que se realizan en los métodos **load** e **index** del controlador de los posts.


### Tarea 5 - Aplicar migración y probar

LLegados a este punto ya se ha terminado todo el desarrollo de la práctica.

Solo falta aplicar la migración creada en la tareas anteriores ejecutando:
      # sistemas unix
      npm run migrate
      # sistemas windows
      npm run migrate_win

y probar el funcionamiento del nuevo servidor.


## Prueba de la práctica

Para ayudar al desarrollo, se provee una herramienta de autocorrección que prueba las distintas funcionalidades que se piden en el enunciado. Para utilizar esta herramienta debes tener node.js (y npm) (https://nodejs.org/es/) y Git instalados.

Para instalar y hacer uso de la herramienta de autocorrección en el ordenador local, ejecuta los siguientes comandos en el directorio raíz del proyecto, es decir, en el directorio padre del directorio **post**:

    $ sudo npm install -g autocorector    ## Instala el programa de test
    $ autocorector                   ## Pasa los tests al fichero a entregar
    ............................     ## en el directorio de trabajo
    ... (resultado de los tests)

También se puede instalar como paquete local, en el caso de que no dispongas de permisos en
el ordenador en el que estás trabajando:

    $ npm install autocorector     ## Instala el programa de test
    $ npx autocorector             ## Pasa los tests al fichero a entregar
    ............................   ## en el directorio de trabajo
    ... (resultado de los tests)

Se puede pasar la herramienta de autocorrección tantas veces como se desee sin ninguna repercusión en la calificación.



## Instrucciones para la Entrega y Evaluación.

Una vez satisfecho con su calificación, el alumno puede subir su entrega a Moodle con el siguiente comando:

    $ autocorector --upload

o, si se ha instalado como paquete local:

    $ npx autocorector --upload

La herramienta de autocorrección preguntará por el correo del alumno y el token de Moodle.
En el enlace **https://www.npmjs.com/package/autocorector** se proveen instrucciones para encontrar dicho token.

**RÚBRICA**: Se puntuará el ejercicio a corregir sumando el % indicado a la nota total si la parte indicada es correcta:

- **20%:** Si hay un usuario logueado y crea un post, entonces el campo **authorId** del post debe ser igual al **id** del usuario logueado.
- **15%:** Si no hay un usuario logueado y se crea un post, entonces el campo **authorId** del post debe estar vacío.
- **20%:** Si un post tiene autor, entonces la vista **show** de ese post debe mostrar el nombre del autor.
- **15%:** Si un post no tiene autor, entonces la vista **show** de ese post debe mostrar el texto **Anonymous** como nombre del autor.
- **30%:** La vista **index** debe mostrar el nombre del autor o el texto **Anonymous** para todos los posts listados.

Si pasa todos los tests se dará la máxima puntuación.

