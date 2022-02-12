const globalState = {
	accountState: [],
	historyState: [],
	// loading: {type: '', flag: false}
};

//loading state
// let isLoading = false;

//local state
let accountInfo = {
	name: '',
	balance: 0,
};

//local state
//intermediary -> history -> account - use and dump
//search -> find -> update (from--, to++) - this search operation is mediocre (should-ve been done via email - multiple accounts might share the same name.)
// let toBeUpdated = {
//   to_ID : '',
//   from_ID : ''
// }

const setState = (type, payload) => {
	if (type === 'ADD_ACCOUNT') {
		globalState.accountState = [...globalState.accountState, payload];
		triggerAccountRender();
	}

	if (type === 'ADD_TRANSACTION') {
		// triggerHistoryRender();
		// triggerAccountRender();
	}

	console.log(globalState);
	triggerRender();
};

const triggerAccountRender = () => {
	const accountList = document.querySelector('.account-list');
	accountList.innerHTML = '';

	const generateAccountDOM = (id, name, balance) => {
		const li = document.createElement('li');
		li.dataset.id = id;
		li.innerHTML = `<span id="acc-name">${name}</span><span class="acc-balance">$${balance}</span>`;

		return li;
	};

	globalState.accountState.forEach(({ id, name, balance }) =>
		accountList.append(generateAccountDOM(id, name, balance))
	);
};

const triggerRender = () => {
	const transactionList = document.querySelector('transaction-list');
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

	console.log(accountInfo);
};

accountForm.addEventListener('submit', handleAccountSubmit);
accountForm.addEventListener('keyup', handleAccountChange);

//populate fields from LS
// const getDataFromLS = () =>
//  window.addEventListener('DOMContentLoaded', getDataFromLS)
