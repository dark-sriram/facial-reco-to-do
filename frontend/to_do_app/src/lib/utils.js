export function formatDate(date){
    return date.toLocaleDateString("en-GB",{
        month:"short",
        day:"numeric",
        year:"numeric",
    })
};