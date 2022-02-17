const globalState = {
	accountState: [],
	historyState: [],
	transactionState: [],
};

//local account state
let accountInfo = {
	name: '',
	balance: 0,
	id: '',
};

//local transaction state
let transactionInfo = {
	from: { id: '', name: '' },
	to: { id: '', name: '' },
	amount: 0,
	transactionId: '',
};

//local history state
let transactionHistory = '';

// load dom elements and event listeners (globally, in one place)
let accountList,
	accountForm,
	addAccountBtn,
	transactionForm,
	transactionHistoryList,
	addTransactionBtn,
	transactionAmount,
	transactionResults,
	resultFrom,
	resultTo,
	searchAccount,
	searchResults;

window.addEventListener('DOMContentLoaded', () => {
	//**Pertaining to account list**

	// DOM Elements
	accountList = document.querySelector('.account-list');
	accountForm = document.querySelector('.add-user');
	addAccountBtn = document.querySelector('.add-user').querySelector('button');

	// EVENT Listeners
	accountForm.addEventListener('submit', handleAccountSubmit);
	accountForm.addEventListener('keyup', handleAccountChange);
	accountList.addEventListener('click', removeAccount);

	//**Pertaining to transactions**
	transactionHistoryList = document.querySelector('.transaction-list');
	transactionForm = document.querySelector('.add-transaction');
	addTransactionBtn = document.querySelector('#transaction-submit');
	transactionAmount = document.querySelector('#transaction-amount');
	transactionResults = document.querySelector('#transaction-results');
	resultFrom = document.querySelector('#result-from');
	resultTo = document.querySelector('#result-to');

	transactionForm.addEventListener('click', locateTransactionEvent);
	transactionAmount.addEventListener('keyup', handleTransactionAmount);

	searchAccount = document.querySelector('.search-account');
	searchResults = document.querySelector('.search-results');

	searchResults.addEventListener('click', makeSelection);
});

const setState = (type, payload) => {
	if (type === 'ADD_ACCOUNT') {
		globalState.accountState = [...globalState.accountState, payload];
		triggerAccountRender();
		updateTransactionSearch();
	}

	if (type === 'REMOVE_ACCOUNT') {
		globalState.accountState = globalState.accountState.filter(
			(acc) => acc.id !== payload
		);
		triggerAccountRender();
		updateTransactionSearch();
	}

	if (type === 'ADD_TRANSACTION') {
		updateBalance(payload);
		updateHistory(payload);
		triggerAccountRender();
		triggerHistoryRender();
	}

	if (type === 'REVOKE_TRANSACTION') {
		// reject IF user not found!
	}
};

const updateBalance = (transactionInfo) => {
	globalState.accountState = globalState.accountState.map((account) => {
		if (account.id === transactionInfo.from.id) {
			return { ...account, balance: account.balance - transactionInfo.amount };
		}
		if (account.id === transactionInfo.to.id) {
			return { ...account, balance: account.balance + transactionInfo.amount };
		}
		return account;
	});
};

const updateHistory = (transactionInfo) => {
	transactionHistory = `${formatName(
		transactionInfo.from.name
	)} sent ${formatPrice(transactionInfo.amount)} to ${formatName(
		transactionInfo.to.name
	)}`;
	globalState.historyState = [...globalState.historyState, transactionHistory];
	transactionHistory = '';
};

const triggerAccountRender = () => {
	accountList.innerHTML = '';

	const generateAccountDOM = (id, name, balance) => {
		const li = document.createElement('li');
		li.dataset.id = id;
		li.innerHTML = `
		
    <span id="acc-name"><span id="remove-account-btn">X</span>${formatName(
			name
		)} </span>
    <span class="acc-balance">${formatPrice(balance)}</span>
    `;

		return li;
	};

	globalState.accountState.forEach(({ id, name, balance }) =>
		accountList.append(generateAccountDOM(id, name, balance))
	);
};

const triggerHistoryRender = () => {
	transactionHistoryList.innerHTML = '';

	globalState.historyState.forEach((history) => {
		let historyLi = document.createElement('li');
		historyLi.classList.add = 'transaction-list-item';
		historyLi.innerText = history;
		transactionHistoryList.prepend(historyLi);
	});
};

const handleAccountSubmit = (e) => {
	e.preventDefault();
	accountInfo.id = generateId();

	const isUser = (function () {
		return globalState.accountState.find(
			(acc) => acc.name === accountInfo.name
		);
	})();

	if (isUser) {
		alert(`Account with the name(email) ${accountInfo.name} already exists`);
	} else {
		setState('ADD_ACCOUNT', accountInfo);
	}

	accountInfo = {};
	addAccountBtn.disabled = true;
	Array.from(e.target.children).forEach((input) => (input.value = ''));
};

const handleAccountChange = (e) => {
	e.preventDefault();

	if (e.target.name === 'account-name') {
		accountInfo.name = e.target.value;
	} else {
		if (
			+e.target.value < 0 ||
			e.target.value.startsWith('-') ||
			e.target.value.startsWith('00')
		) {
			e.target.value = '';
			return;
		}
		accountInfo.balance = +e.target.value;
		if (!accountInfo.balance) {
			e.target.value = '';
			return;
		}
	}

	if (accountInfo.name.length > 5 && accountInfo.balance > 0) {
		addAccountBtn.disabled = false;
	} else {
		addAccountBtn.disabled = true;
	}
};

// TRANSACTIONS
const clearTransactionForm = () => {
	transactionInfo = {
		from: { id: '', name: '' },
		to: { id: '', name: '' },
		amount: 0,
	};
	addTransactionBtn.disabled = true;
	transactionAmount.style.display = 'none';
	transactionAmount.value = '';
	transactionResults.style.display = 'none';
	updateTransactionInfo();
	shouldAmountBeDisplayed();
};

const handleTransactionSubmit = () => {
	setState('ADD_TRANSACTION', transactionInfo);
	clearTransactionForm();
};

const updateTransactionInfo = () => {
	resultFrom.innerText = transactionInfo.from.name;
	resultTo.innerText = transactionInfo.to.name;
	transactionForm.querySelector('.search-account').style.display = 'none';
	document.querySelector('.search-results').classList = 'search-results';
};

const shouldAmountBeDisplayed = () => {
	if (transactionInfo.from.name && transactionInfo.to.name) {
		const maxAmount = globalState.accountState.find(
			(user) => user.id === transactionInfo.from.id
		).balance;
		transactionAmount.style.display = 'block';
		transactionAmount.placeholder = `Amount [Balance: ${formatPrice(
			maxAmount
		)}]`;
	} else {
		transactionAmount.style.display = 'none';
	}
};

const makeSelection = (e) => {
	if (e.currentTarget.classList.contains('from')) {
		if (e.target.dataset.id) {
			transactionInfo.from = {
				id: e.target.dataset.id,
				name: e.target.textContent,
			};
		}
	}
	if (e.currentTarget.classList.contains('to')) {
		if (e.target.dataset.id) {
			transactionInfo.to = {
				id: e.target.dataset.id,
				name: e.target.textContent,
			};
		}
	}

	if (transactionInfo.from.name || transactionInfo.to.name) {
		document.querySelector('#transaction-results').style.display = 'flex';
	}

	updateTransactionInfo();
	shouldAmountBeDisplayed();
};

const fetchSearchResults = () => {
	let li = '';
	if (globalState.accountState.length < 1) {
		li = `<li>Account list is currently empty, consider adding an account.</li>`;
	} else {
		globalState.accountState.forEach(
			({ id, name }) =>
				(li += `
			<li data-id="${id}">${formatName(name)}</li>`)
		);
	}
	return li;
};

const updateTransactionSearch = () => {
	searchResults.innerHTML = fetchSearchResults();
};

const displaySearchResults = (identifier) => {
	let searchIdentifier = document.querySelector('#search-input');

	if (identifier === 'from') {
		searchIdentifier.placeholder = 'SENDER: Search Account';
		searchResults.classList.add('from');
	} else {
		searchIdentifier.placeholder = 'RECEIVER: Search Account';
		searchResults.classList.add('to');
	}

	updateTransactionSearch();
	searchAccount.style.display = 'block';
};

const locateTransactionEvent = (e) => {
	if (e.target.id === 'from-btn') {
		displaySearchResults('from');
	}
	if (e.target.id === 'to-btn') {
		displaySearchResults('to');
	}
	if (e.target.id === 'close-search') {
		searchAccount.style.display = 'none';
		searchResults.classList = 'search-results';
	}
	if (e.target.id === 'transaction-submit') {
		e.preventDefault();
		handleTransactionSubmit();
	}
	return;
};

const handleTransactionAmount = (e) => {
	const maxBalance = globalState.accountState.find(
		(user) => user.id === transactionInfo.from.id
	).balance;

	if (+e.target.value > maxBalance) {
		e.target.value = maxBalance;
	}
	if (
		+e.target.value < 0 ||
		e.target.value.startsWith('-') ||
		e.target.value.startsWith('00')
	) {
		e.target.value = '';
		return;
	}
	transactionInfo.amount = +e.target.value;

	if (transactionInfo.amount > 0 && transactionInfo.amount <= maxBalance) {
		addTransactionBtn.disabled = false;
	} else {
		addTransactionBtn.disabled = true;
	}
};

const removeAccount = (e) => {
	// make use of event delegation to remove account
	console.log('true');
	if (e.target.id === 'remove-account-btn') {
		const accountToBeRemoved = e.target.parentElement.parentElement.dataset.id;
		setState('REMOVE_ACCOUNT', accountToBeRemoved);

		//get user id from parent.dataset.id and filter globalState.accountState and re-render!
	} else {
		return;
	}
};

// remove account
// revoke transaction
