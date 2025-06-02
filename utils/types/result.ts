
type Failure<E = unknown> = {
    _tag: "Failure";
    error: E;
}
type Success<T = void> = {
    _tag: "Success";
    data: T;
}

type Result<T = void, E = unknown> = Failure<E> | Success<T>;

export default Result;