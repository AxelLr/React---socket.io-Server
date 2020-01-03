exports.isUser = function(userList, name) {
    return userList.find(item => item.user === name) 
}
