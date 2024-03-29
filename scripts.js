const Modal = {
    open(){
        document
        .querySelector('.modal-overlay') // busca a class 
        .classList  // preparação para fazer alguma coisa com uma class
        .add('active') // adiciona uma class com o nome 'active'
    },
    close(){
        document
        .querySelector('.modal-overlay') // busca a class 
        .classList // preparação para fazer alguma coisa com uma class
        .remove('active') // remove uma class com o nome 'active'
    }
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions",
        JSON.stringify(transactions))
    }
}


const Transaction = {
    all: Storage.get(),
    
    // transactions = [
    //     {
    //         description: 'Aluguel',
    //         amount: -50000,
    //         date: '01/02/2021',
    //     },
    
    //     {
    //         description: 'Web Site',
    //         amount: 500000,
    //         date: '01/02/2021',
    //     },
    
    //     {
    //         description: 'Internet',
    //         amount: -20000,
    //         date: '01/02/2021',
    //     }, 
    // ],

    add(transaction) {
        Transaction.all.push(transaction)
        
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0

        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0) {
                income += transaction.amount
            }
        })

        return income

    },

    expense() {
        let expense = 0
        Transaction.all.forEach(function(transaction){
            if(transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense
    }, 

    total() {
        return Transaction.incomes() + Transaction.expense()
    }
}

// Adiciçao das transações e tratamento do CSS 
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `

        return html
    },

    updateBalance() {
        document
        .getElementById('incomeDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
        .getElementById('expenseDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.expense())
        document
        .getElementById('totalDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.total())
    }, 

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

// É feita a formataçao do valor armazenado
const Utils = {
    formatAmount(value) {
        value = Number(value) * 100

        return Math.round(value)
    },

    formatDate(date){
        const splittedDate = date.split("-")

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        
        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    // verificar se todas as informações foram preenchidas
    validateFields(){
        const { description, amount, date } = Form.getValues()

        if(description.trim() === ""|| 
           amount.trim() === "" ||
           date.trim() === "") {
               throw new Error("Por favor, preencha todos os campos")
        }
    },

    // formatar os dados para salvar
    formatValues(){
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    // Adiciona nova transação
    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    // Limpar os campos 
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event){
        event.preventDefault()

        try {
            Form.validateFields()

            const transaction  = Form.formatValues()

            Form.saveTransaction(transaction)

            Form.clearFields()

            // Fechar o modal
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        // Para apresnetar todas as transações efetuadas e armazenadas
        Transaction.all.forEach(function(transaction, index) {
            DOM.addTransaction(transaction, index)
        })

        DOM.updateBalance()

        Storage.set(Transaction.all)
    }, 

    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()