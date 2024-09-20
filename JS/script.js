document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('postForm');
    const postList = document.getElementById('postList');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    const loggedInUser = document.getElementById('loggedInUser');
    const loggedInUsername = document.getElementById('loggedInUsername');
    const authForm = document.getElementById('authForm');
    const addPostSection = document.querySelector('.add-post');

    let currentUser = null;

    // Verificar se há um usuário logado armazenado no localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser(currentUser);
    }

    // Função para exibir o nome de usuário logado
    function updateUIForLoggedInUser(user) {
        if (user) {
            loggedInUsername.textContent = user.username;
            document.getElementById('profileName').textContent = user.username;
            loggedInUser.style.display = 'block';
            authForm.style.display = 'none';
            addPostSection.style.display = 'block';
        } else {
            loggedInUser.style.display = 'none';
            authForm.style.display = 'block';
            addPostSection.style.display = 'none';
        }
    }

    // Função para salvar os dados de um usuário no localStorage
    function saveUserToStorage(user) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Função para carregar usuário do localStorage
    function loadUserFromStorage(username, password) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        return users.find(user => user.username === username && user.password === password);
    }

    // Função para validar o nome de usuário
    function validateUsername(username) {
        return username.length >= 3;
    }

    // Função para validar a senha
    function validatePassword(password) {
        return password.length >= 8;
    }

    // Função para salvar o post no localStorage
    function savePostToStorage(post) {
        let posts = JSON.parse(localStorage.getItem('posts')) || [];
        posts.push(post);
        localStorage.setItem('posts', JSON.stringify(posts));
        renderPost(post);
    }

    // Função para carregar posts do localStorage
    function loadPostsFromStorage() {
        let posts = JSON.parse(localStorage.getItem('posts')) || [];
        posts.forEach(post => renderPost(post));
    }

    // Função para renderizar um post na página
    function renderPost(post) {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.setAttribute('data-id', post.id);

        postElement.innerHTML = `
            <img src="${post.image}" alt="${post.title}">
            <h3>${post.title}</h3>
            <p>${post.description}</p>
            <p><strong>Publicado por:</strong> ${post.username}</p>
            <button class="like-btn">Curtir (<span class="like-count">${post.likes}</span>)</button>
        `;

        // Adiciona o evento de curtir
        const likeBtn = postElement.querySelector('.like-btn');
        likeBtn.addEventListener('click', () => {
            if (!currentUser) {
                alert('Você precisa estar logado para curtir.');
                return;
            }
            if (post.likedBy.includes(currentUser.username)) {
                alert('Você já curtiu este post.');
            } else {
                post.likes++;
                post.likedBy.push(currentUser.username);
                likeBtn.querySelector('.like-count').textContent = post.likes;
                updateLikesInStorage(post);
            }
        });

        postList.prepend(postElement);
    }

    // Função para atualizar curtidas no localStorage
    function updateLikesInStorage(updatedPost) {
        let posts = JSON.parse(localStorage.getItem('posts')) || [];
        posts = posts.map(post => post.id === updatedPost.id ? updatedPost : post);
        localStorage.setItem('posts', JSON.stringify(posts));
    }

    // Login
    loginBtn.addEventListener('click', () => {
        const username = usernameField.value;
        const password = passwordField.value;

        const user = loadUserFromStorage(username, password);
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser)); // Armazena o usuário logado
            updateUIForLoggedInUser(user);
        } else {
            alert('Usuário ou senha incorretos!');
        }
    });

    // Registro
    registerBtn.addEventListener('click', () => {
        const username = usernameField.value;
        const password = passwordField.value;

        // Validação de usuário e senha
        if (!validateUsername(username)) {
            alert('O nome de usuário deve ter pelo menos 3 letras.');
            return;
        }

        if (!validatePassword(password)) {
            alert('A senha deve ter pelo menos 8 caracteres.');
            return;
        }

        const existingUser = loadUserFromStorage(username, password);
        if (existingUser) {
            alert('Usuário já existe!');
        } else {
            const newUser = { username, password };
            saveUserToStorage(newUser);
            alert('Usuário registrado com sucesso!');
        }
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('currentUser'); // Remover o usuário logado
        updateUIForLoggedInUser(null);
    });

    // Adicionar post
    postForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!currentUser) {
            alert('Você precisa estar logado para adicionar um post.');
            return;
        }

        const title = document.getElementById('postTitle').value;
        const image = document.getElementById('postImage').value;
        const description = document.getElementById('postDescription').value;

        const post = {
            id: Date.now(),
            title,
            image,
            description,
            username: currentUser.username, // Associar post ao usuário logado
            likes: 0,
            likedBy: [] // Lista de usuários que curtiram o post
        };

        // Salvar post no localStorage
        savePostToStorage(post);

        // Limpar o formulário após o envio
        postForm.reset();
    });

    // Carregar posts existentes do localStorage
    loadPostsFromStorage();
});
