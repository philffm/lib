// SPDX-License-Identifier: MIT
// based on https://github.com/ConsenSys/artifaqt/blob/master/contract/contracts/KOIOSNFT
// Use for educational purposes only // without approval functions
// Extended with templates
pragma solidity ^0.6.9;

contract KOIOSNFT {  
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);

    string public  name;
    string public  symbol;
    address public  admin;
    uint256 public  counter = 10;
    
    uint256[]                      public allTokens; 
    mapping(uint256 => uint256)    public allTokensIndex;      
    mapping(address => uint256[])  public ownedTokens;  
    mapping(uint256 => uint256)    public ownedTokensIndex;     
    mapping(uint256 => address)    public ownerOfToken;
    mapping(uint256 => uint256)    public templateOf; // bundle NTF's
    mapping(uint256 => uint256[])  public typedTokens; // get list per bundle
    mapping(uint256 => uint256)    public typedTokensIndex;     
    
    
    mapping(address => mapping( uint256 => uint256))  public ownedTypedTokens;  
    
    
    
    struct Template {
        string  name;
        string  cid;
        bool SelfMint;
        bool SelfBurn; 
        bool AllowTransfer;
        uint256 Manager;
    }

    Template[] public templates;
    // Base URI
    string private baseURI;
    
    address public receivedOperator;    // public to easily check
    address public receivedFrom;        // public to easily check
    uint256 public receivedTokenId;     // public to easily check
    bytes   public receivedData;        // public to easily check
    bytes4 internal constant ERC721_BASE_INTERFACE_SIGNATURE = 0x80ac58cd;
    bytes4 internal constant ERC721_METADATA_INTERFACE_SIGNATURE = 0x5b5e139f;
    bytes4 internal constant ERC721_ENUMERABLE_INTERFACE_SIGNATURE = 0x780e9d63;
    bytes4 internal constant ONERC721RECEIVED_FUNCTION_SIGNATURE = 0x150b7a02;

    uint256 public constant CONTRACTINFOMANAGER = 0;
    uint256 public constant CONTRACTINFO = 1;
    uint256 public constant ADMINTOKENMANAGER   = 2;
    uint256 public constant ADMINTOKEN   = 3;
    uint256 public constant BADGECREATORTOKENMANAGER = 4;
    uint256 public constant BADGECREATORTOKEN = 5;
    
    

    modifier tokenExists(uint256 _tokenId) {
        require(uint256(ownerOfToken[_tokenId]) != 0);
        _;
    }
    
    modifier isAdmin {
        require(msg.sender == admin || (ownedTypedTokens[msg.sender][ADMINTOKEN] > 0),"Must have admin role to create token");
        _;
    }
    
    modifier isBadgeCreator {
        require(msg.sender == admin || (ownedTypedTokens[msg.sender][ADMINTOKEN] > 0) || (ownedTypedTokens[msg.sender][BADGECREATORTOKEN] > 0),"Must have admin or badge creator role ");
        _;
    }
    
    modifier isManager(uint256 _templateId) {
        require(msg.sender == admin || 
            (ownedTypedTokens[msg.sender][ADMINTOKEN] > 0) || (ownedTypedTokens[msg.sender][BADGECREATORTOKEN] > 0) || (ownedTypedTokens[msg.sender][templates[_templateId].Manager] > 0),"Must have admin, badgecreator or manager role for the badge");
        _;
        
    }        
    
    
    
    // string memory _name, string memory _symbol, string memory _baseURI, string memory _cidcontract,string memory _cidadmin
    constructor () public {
        admin = msg.sender;
        name = "koios";
        symbol = "koios";
        baseURI = "ipfs://ipfs/";
        CreateNewBadge(name, "QmacmwVNLeQL4DjhPojty5chL7G7g1ZA19SgsnrM8DR8Cs", true,true,true);
        CreateNewBadge("admin", "QmZGUeT4yYrbtRPbTgj1rFwVNaUJAMmX28PBwCJ5Qiq64n", true,true,true);
        CreateNewBadge("badgecreator", "QmW5D7h6evMcqoJVreKGNj5uQAfd4ewdoNcStAXKN4BaUu", true,true,true);

    }
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes memory _data) public returns(bytes4) {
        receivedOperator = _operator;
        receivedFrom     = _from;
        receivedTokenId  = _tokenId;
        receivedData     = _data;
        return ONERC721RECEIVED_FUNCTION_SIGNATURE;    
    } 
    modifier allowedToTransfer(address _from, address _to, uint256 _tokenId) {
        require(ownerOfToken[_tokenId] == _from);
        require(uint256(_to) != 0); //not allowed to burn in transfer method
        _;
    }
   
    function settleTransfer(address _from, address _to, uint256 _tokenId) internal {
        removeToken(_from, _tokenId);
        addToken(_to, _tokenId);
        emit Transfer(_from, _to, _tokenId);
    }
    function addToken(address _to, uint256 _tokenId) internal {
        allTokens.push(_tokenId);
        allTokensIndex[_tokenId] = allTokens.length-1;
        ownerOfToken[_tokenId] = _to;        
        ownedTokens[_to].push(_tokenId);
        ownedTokensIndex[_tokenId] = ownedTokens[_to].length-1;
        
        uint256 templateId=templateOf[_tokenId];
        ownedTypedTokens[_to][templateId]++;
    }
    function removeToken(address _from, uint256 _tokenId) internal {
        uint256 allIndex = allTokensIndex[_tokenId];
        uint256 allTokensLength = allTokens.length;
        allTokens[allIndex] = allTokens[allTokensLength - 1];
        allTokensIndex[allTokens[allTokensLength-1]] = allIndex;
        allTokens.pop();
        
        uint256 ownerIndex = ownedTokensIndex[_tokenId];
        uint256 ownerLength = ownedTokens[_from].length;
        ownedTokens[_from][ownerIndex] = ownedTokens[_from][ownerLength-1];
        ownedTokensIndex[ownedTokens[_from][ownerLength-1]] = ownerIndex;
        ownedTokens[_from].pop();
        uint256 templateId=templateOf[_tokenId];
        ownedTypedTokens[_from][templateId]++;
         
        delete ownerOfToken[_tokenId];
    }
    
    // public functions -------------------------------------------------------------------------------
    
    function transferFrom(address _from, address _to, uint256 _tokenId) public payable
    tokenExists(_tokenId)
    allowedToTransfer(_from, _to, _tokenId) {       
        settleTransfer(_from, _to, _tokenId);
    }
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes memory data) public payable
    tokenExists(_tokenId)
    allowedToTransfer(_from, _to, _tokenId) {
        settleTransfer(_from, _to, _tokenId);
        uint256 size;
        assembly { size := extcodesize(_to) }  // solhint-disable-line no-inline-assembly
        if (size > 0) {
            require(KOIOSNFT(_to).onERC721Received(msg.sender, _from, _tokenId, data) == ONERC721RECEIVED_FUNCTION_SIGNATURE);
        }
    }
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) public payable
    tokenExists(_tokenId)
    allowedToTransfer(_from, _to, _tokenId) {
        settleTransfer(_from, _to, _tokenId);
        uint256 size;
        assembly { size := extcodesize(_to) }  // solhint-disable-line no-inline-assembly
        if (size > 0) {
            require(KOIOSNFT(_to).onERC721Received(msg.sender, _from, _tokenId, "") == ONERC721RECEIVED_FUNCTION_SIGNATURE);
        }
    }
    function totalSupply() public view returns (uint256) {
        return allTokens.length;
    }
    function ownerOf(uint256 _tokenId) external view
    tokenExists(_tokenId) returns (address) {
        return ownerOfToken[_tokenId];
    }
    function tokenByIndex(uint256 _index) external view returns (uint256) {
        require(_index < allTokens.length);
        return allTokens[_index];
    }
    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256 _tokenId) {
        require(_index < ownedTokens[_owner].length);
        return ownedTokens[_owner][_index];
    }
    function balanceOf(address _owner) external view returns (uint256) {
        require(uint256(_owner) != 0);
        return ownedTokens[_owner].length;
    }

    function tokensOfType(uint256 _type) external view returns (uint256) {
        return typedTokens[_type].length;
    }
    function tokenOfTypeByIndex(uint256 _type, uint256 _index) external view returns (uint256 _tokenId) {
        require(_index < typedTokens[_type].length);
        return typedTokens[_type][_index];
    }
    
    function tokenURI(uint256 _tokenId) public view returns (string memory) {
        uint256 templateId=templateOf[_tokenId];
        return string(abi.encodePacked(baseURI, templates[templateId].cid));
    }
    
    
    
    function supportsInterface(bytes4 interfaceID) external pure returns (bool) {
        if (interfaceID == ERC721_BASE_INTERFACE_SIGNATURE ||
        interfaceID == ERC721_METADATA_INTERFACE_SIGNATURE ||
        interfaceID == ERC721_ENUMERABLE_INTERFACE_SIGNATURE) {
            return true;
        } else { return false; }
    }
    
    
    function createToken(address _minter,uint256 _templateId) public isManager( _templateId) {
        
        templateOf[counter]=_templateId;
        typedTokens[_templateId].push(counter);
        typedTokensIndex[_templateId] = typedTokens[_templateId].length-1;
        
        addToken(_minter, counter);
        emit Transfer(address(0), _minter, counter);
        counter += 1; // every new token gets a new ID
    }
    function burnToken(uint256 _tokenId) public {
        require(ownerOfToken[_tokenId] == msg.sender,"Token should be in control of owner");
        uint256 templateId=templateOf[_tokenId];
         
        uint256 typedIndex = typedTokensIndex[_tokenId];
        uint256 typedLength = typedTokens[templateId].length;
        typedTokens[templateId][typedIndex] = typedTokens[templateId][typedLength-1];
        typedTokensIndex[typedTokens[templateId][typedLength-1]] = typedIndex;
        typedTokens[templateId].pop();
        
        removeToken(msg.sender, _tokenId);
        emit Transfer(msg.sender, address(0), _tokenId);
    }

    function CreateNewBadge(string memory _name, string memory _cid, bool _SelfMint, bool _SelfBurn, bool _AllowTransfer) public  isBadgeCreator returns (uint256)  {
        

       
       templates.push(Template(string(abi.encodePacked(_name, "-manager")), "QmW5D7h6evMcqoJVreKGNj5uQAfd4ewdoNcStAXKN4BaUu" ,  false,false,false,0));
       templates.push(Template(_name, _cid,  _SelfMint,  _SelfBurn,  _AllowTransfer,templates.length-1)); // manager is the token perviousely created
       
       createToken(admin,templates.length-2); // give everything also to admin
       createToken(admin,templates.length-1); // give everything also to admin
       
       return templates.length-1;
    }
    
    
    function assignManager(address _to, uint256 _templateid) public isBadgeCreator {
         createToken(_to,templates[_templateid].Manager);
    }
    
    function UpdateBadge(uint256 _templateid,string memory _name, string memory _cid, bool _SelfMint, bool _SelfBurn, bool _AllowTransfer, uint256 _Manager) public isAdmin {
       
       templates[_templateid]=Template(_name, _cid,  _SelfMint,  _SelfBurn,  _AllowTransfer, _Manager);
    }
    
    
    function nrTemplates() external view returns (uint256) {
        return templates.length;
    }
    function setBaseURI(string memory _baseURI) public isAdmin {
         baseURI = _baseURI;
    }
    
    function contractURI() public view returns (string memory) { // for opensea, use the template#0
        return string(abi.encodePacked(baseURI, templates[0].cid));
    }


    function checkIsAdmin() public view returns (bool) {
        return msg.sender == admin || (ownedTypedTokens[msg.sender][ADMINTOKEN] > 0);
    }
    
    function checkIsBadgeCreator() public view returns (bool)  {
        return msg.sender == admin || (ownedTypedTokens[msg.sender][ADMINTOKEN] > 0) || (ownedTypedTokens[msg.sender][BADGECREATORTOKEN] > 0);
    }
    
    function checkIsManager(uint256 _templateId) public view returns (bool)  {
        return msg.sender == admin || (ownedTypedTokens[msg.sender][ADMINTOKEN] > 0) || (ownedTypedTokens[msg.sender][templates[_templateId].Manager] > 0);

    }        
    


}
