
export const validateUserQuery = (content : string) : boolean => {
    return true 
} 

export const truncateUserQuery = (content : string , limit : number = 500) : string => {  //Cat ra limit tu dau tien (khong cho nhieu hon di vao)
    return  content.split('').slice(-limit).join('') 
}