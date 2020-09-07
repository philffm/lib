// SPDX-License-Identifier: MIT
// Adapted from https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/token/ERC20
// https://raw.githubusercontent.com/web3examples/ethereum/master/token_examples/VeryBasicToken.sol

pragma solidity ^0.7.0;

contract ERC20Token {
    string private _name;
    string private _symbol;
    uint8 private _decimals;
    address public  _admin;
	address public _factory;
	
	string private _tokenURI;
    mapping (address => uint256) private _balances;
	mapping (address => mapping (address => uint256)) private _allowances;
    uint256 private _totalSupply;
    
    mapping(address => uint256) private index;
    address[] private allowners; 
    

    event Transfer(address indexed from, address indexed to, uint256 value);
	event Approval(address indexed owner, address indexed spender, uint256 value);
	
    modifier isAdmin {
        require( (msg.sender == _admin) || (msg.sender==_factory),"Must have admin role");
        _;
    }
    constructor (string memory name, string memory symbol, uint8 decimals,string memory tokenURI,address admin) {
	    _admin = admin;
        _name = name;
        _symbol = symbol;
        _decimals = decimals;
		_factory = msg.sender;
		_tokenURI = tokenURI;
		allowners.push(address(0)); // keep the 0 value occupied
        _mint(admin, 10000 * (10 ** uint256(_decimals)));
    }
	function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        _balances[sender] = sub(_balances[sender],amount,"ERC20: transfer amount exceeds balance");
        _balances[recipient] = add(_balances[recipient],amount);
        
        if (index[recipient] == 0) {
            allowners.push(recipient);
            index[recipient]=allowners.length-1;
        }
        
        emit Transfer(sender, recipient, amount);
    }
    function _mint(address account, uint256 amount) internal isAdmin {
        require(account != address(0), "ERC20: mint to the zero address");
        _totalSupply = add(_totalSupply,amount);
        _balances[account] = add(_balances[account],amount);
        
        if (index[account] == 0) {
            allowners.push(account);
            index[account]=allowners.length-1;
        }
        emit Transfer(address(0), account, amount);
    }

	function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }


// public functions -------------------------------------------------------------------------------
    function name() public view returns (string memory) {
        return _name;
    }
    function symbol() public view returns (string memory) {
        return _symbol;
    }
    function decimals() public view returns (uint8) {
        return _decimals;
    }
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }  
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        uint256 c = a - b;
        return c;
    }
    
	function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;
        return c;
    }
    
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }
    function transfer(address recipient, uint256 amount) public returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }
	
	 function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }
	
	 function approve(address spender, uint256 amount) public  returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }
	
    function transferFrom(address sender, address recipient, uint256 amount) public   returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, msg.sender, sub(_allowances[sender][msg.sender],amount, "ERC20: transfer amount exceeds allowance"));
        return true;
    }
    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        _approve(msg.sender, spender, add(_allowances[msg.sender][spender],addedValue));
        return true;
    }
    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        _approve(msg.sender, spender, sub(_allowances[msg.sender][spender],subtractedValue, "ERC20: decreased allowance below zero"));
        return true;
    }
	
	function transferBulk(address[] memory recipients, uint256[] memory amounts) public returns (bool) {      
        for(uint256 i=0; i<recipients.length; i++)          
           _transfer(msg.sender, recipients[i], amounts[i]);
          return true;
    }
	
    function GetOwner(uint256 _nr) public view returns ( address)   {       
       return allowners[_nr];
    }
    
    function nrOwners() external view returns (uint256) {
        return allowners.length;
    }
	
	
    function adminmint(uint256 amount) public isAdmin {
		_mint(msg.sender, amount);
	}
	
	function tokenURI() public view returns (string memory) {
        return _tokenURI;
    }
	
	function setTokenURI(string memory settokenURI) public isAdmin {
         _tokenURI = settokenURI;
    }
	
	function destroy() public isAdmin {         
        selfdestruct(msg.sender);
    }
}

contract ERC20TokenFactory {
	address public  admin;
	ERC20Token[] public tokens;
	constructor () {
	    admin = msg.sender;       
    }
	modifier isAdmin {
        require(msg.sender == admin,"Must have admin role");
        _;
    }
    function createToken(string memory _name, string memory _symbol, uint8 _decimals,string memory _tokenURI) public isAdmin returns (ERC20Token)  {
        tokens.push(new ERC20Token(_name, _symbol, _decimals,_tokenURI,admin));
    }
	function NrTokens() public view returns(uint256) {
	   return tokens.length;
	}
	function destroy() public isAdmin {         
		uint arrayLength = tokens.length;
        for (uint i = 0; i < arrayLength; i++) 
            tokens[i].destroy();
        selfdestruct(msg.sender);
    }
}