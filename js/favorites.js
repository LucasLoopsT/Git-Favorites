import { GithubUser } from "./githubUser.js";

class Favorites{
    constructor(root){
        this.root = document.querySelector(root)

        this.tbody = document.querySelector("table tbody");

        this.loadDatas();
    }

    loadDatas(){
        this.entradas = JSON.parse(localStorage.getItem('@github-favorites:')) || [];
    }

    save(){
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entradas));
    }

    async addUser(userName){
        try{
            const user = await GithubUser.search(userName);
            console.log(user)
            
            const userExists = this.entradas.find(entry => entry.login.toLowerCase() === userName.toLowerCase())

            if(userExists){
                throw new Error("Usuário já cadastrado");
            }

            if(user.login === undefined){
                throw new Error("Usuário não encontrado!");
            }

            this.entradas = [user, ...this.entradas];
            this.update();
            this.save();

        }catch(error){
            alert(error.message)
        }
    }

    delete(user){
        const filtteredEntries = this.entradas.filter(entry => entry.login !== user.login);
 
        this.entradas = filtteredEntries;
        this.update();
        this.save();
    }
}

export class FavoritesView extends Favorites {
    constructor(root){
        super(root)

        this.update();
        this.onAdd();
    }

    onAdd(){
        const addButton = this.root.querySelector("#search-container button")
        addButton.onclick = () => {
            const {value} = this.root.querySelector('#search-container input')
            this.addUser(value);
        }
    }

    update(){
        this.removeAllTr();

        if(this.entradas.length === 0){
            const emptyrowDisplay = this.noUserScreen()   
            emptyrowDisplay.classList.add("noUserHere")    
            this.tbody.append(emptyrowDisplay)
        }
    
        this.entradas.forEach( user => {
            
            const row = this.createRow()
                        
            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Imagem de ${user.name}`

            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = user.login

            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers
            
            row.querySelector('.remove').onclick = () =>{
                const isOk = confirm('Quer mesmo deletar este usuário?');

                if(isOk){
                    this.delete(user)
                }
            }
            this.tbody.append(row)
        })
    }

    removeAllTr(){
        this.tbody.querySelectorAll("tr").forEach((tr) => {
            tr.remove()
        });
    }

    createRow(){
        const tr = document.createElement("tr");

        tr.innerHTML = `
        <td class="user">
            <img src="..." alt="...">
            <a href="..." target="_blank">
                <p>...</p>
                <span>...</span>
            </a>
        </td>
        <td class="repositories">...</td>
        <td class="followers">...</td>
        <td>
            <span class="remove">Remover</span>
        </td>` 

        return tr;
    }

    noUserScreen(){
        const tr = document.createElement("tr");

        tr.innerHTML = `
        <td colspan="4">
            <div>
                <img src="imgs/Estrela.png" alt="">
                <h2>Nenhum favorito ainda</h2>
            </div>
        </td>` 

        return tr;
    }
}