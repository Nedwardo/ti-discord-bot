function is_string_numeric(str: string): boolean {
    if (typeof str !== 'string') return false;
    const num = Number(str); 
    return !isNaN(num) && isFinite(num);
}
export default is_string_numeric;