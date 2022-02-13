import { formatName, formatPrice } from './utils.js';

// console.log(formatName('emre murat ozgun JR'));
// console.log(formatPrice(Number('2500')));

const globalState = {
	accountState: [],
	historyState: [],
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
};

//local history state
let transactionHistory = '';

const setState = (type, payload) => {
	if (type === 'ADD_ACCOUNT') {
		globalState.accountState = [...globalState.accountState, payload];
		triggerAccountRender();
		updateTransactionSearch();
	}

	if (type === 'ADD_TRANSACTION') {
		updateBalance(payload);
		updateHistory(payload);
		triggerAccountRender();
		triggerHistoryRender();
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

	console.log(globalState);
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
	const accountList = document.querySelector('.account-list');
	accountList.innerHTML = '';

	const generateAccountDOM = (id, name, balance) => {
		const li = document.createElement('li');
		li.dataset.id = id;
		li.innerHTML = `
    <span id="acc-name">${formatName(name)}</span>
    <span class="acc-balance">${formatPrice(balance)}</span>
    `;

		return li;
	};

	globalState.accountState.forEach(({ id, name, balance }) =>
		accountList.append(generateAccountDOM(id, name, balance))
	);
};

const triggerHistoryRender = () => {
	const transactionHistoryList = document.querySelector('.transaction-list');
	transactionHistoryList.innerHTML = '';

	globalState.historyState.forEach((history) => {
		let historyLi = document.createElement('li');
		historyLi.classList.add = 'transaction-list-item';
		historyLi.innerText = history;
		transactionHistoryList.prepend(historyLi);
	});
};

const accountForm = document.querySelector('.add-user');
const addAccountBtn = document
	.querySelector('.add-user')
	.querySelector('button');

const handleAccountSubmit = (e) => {
	e.preventDefault();
	accountInfo.id = new Date().getTime().toString().slice(0, 10);

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

	// console.log(accountInfo);
};

accountForm.addEventListener('submit', handleAccountSubmit);
accountForm.addEventListener('keyup', handleAccountChange);

// TRANSACTIONS

const transactionForm = document.querySelector('.add-transaction');

const searchAccount = transactionForm.querySelector('.search-account');

const clearTransactionForm = () => {
	transactionInfo = {
		from: { id: '', name: '' },
		to: { id: '', name: '' },
		amount: 0,
	};
	document.querySelector('#transaction-submit').disabled = true;
	document.querySelector('#transaction-amount').style.display = 'none';
	document.querySelector('#transaction-amount').value = '';
	document.querySelector('#transaction-results').style.display = 'none';
	updateTransactionInfo();
	shouldAmountBeDisplayed();
};

const handleTransactionSubmit = () => {
	setState('ADD_TRANSACTION', transactionInfo);
	clearTransactionForm();
};

const fetchSearchResults = () => {
	let li = '';
	if (globalState.accountState.length < 1) {
		li = `<li>Your account list is currently empty, consider adding an account.</li>`;
	} else {
		globalState.accountState.forEach(
			({ id, name }) =>
				(li += `
			<li data-id="${id}">${formatName(name)}</li>`)
		);
	}

	return li;
};

const resultFrom = document.querySelector('#result-from');
const resultTo = document.querySelector('#result-to');

const updateTransactionInfo = () => {
	resultFrom.innerText = transactionInfo.from.name;
	resultTo.innerText = transactionInfo.to.name;
	transactionForm.querySelector('.search-account').style.display = 'none';
	document.querySelector('.search-results').classList = 'search-results';

	console.log(transactionInfo);
};

const shouldAmountBeDisplayed = () => {
	if (transactionInfo.from.name && transactionInfo.to.name) {
		const maxAmount = globalState.accountState.find(
			(user) => user.id === transactionInfo.from.id
		).balance;
		document.querySelector('#transaction-amount').style.display = 'block';
		document.querySelector(
			'#transaction-amount'
		).placeholder = `Amount [max $(${formatPrice(maxAmount)})]`;
	} else {
		document.querySelector('#transaction-amount').style.display = 'none';
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

	console.log(transactionInfo);

	updateTransactionInfo();
	shouldAmountBeDisplayed();
};

const listenTransactionSelection = () => {
	const transactionResults = document.querySelector('.search-results');
	transactionResults.addEventListener('click', makeSelection);
};

const updateTransactionSearch = () => {
	transactionForm.querySelector('.search-results').innerHTML =
		fetchSearchResults();
};

const displaySearchResults = (identifier) => {
	let searchIdentifier = document.querySelector('#search-input');

	if (identifier === 'from') {
		searchIdentifier.placeholder = 'SENDER: Search Account';
		document.querySelector('.search-results').classList.add('from');
	} else {
		searchIdentifier.placeholder = 'RECEIVER: Search Account';
		document.querySelector('.search-results').classList.add('to');
	}

	updateTransactionSearch();
	transactionForm.querySelector('.search-account').style.display = 'block';
	listenTransactionSelection();
};

const locateTransactionEvent = (e) => {
	if (e.target.id === 'from-btn') {
		displaySearchResults('from');
	}

	if (e.target.id === 'to-btn') {
		displaySearchResults('to');
	}

	if (e.target.id === 'close-search') {
		transactionForm.querySelector('.search-account').style.display = 'none';
		document.querySelector('.search-results').classList = 'search-results';
	}

	if (e.target.id === 'transaction-submit') {
		e.preventDefault();
		handleTransactionSubmit();
	}
};

transactionForm.addEventListener('click', locateTransactionEvent);
transactionForm
	.querySelector('#transaction-amount')
	.addEventListener('keyup', (e) => {
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
			document.querySelector('#transaction-submit').disabled = false;
		} else {
			document.querySelector('#transaction-submit').disabled = true;
		}
	});
