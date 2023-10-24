interface IQueueLink<T> {
  value: T;
  next: IQueueLink<T> | undefined;
}

export default class Queue<T> {
  head: IQueueLink<T> | undefined = undefined;
  last: IQueueLink<T> | undefined = undefined;
  size: number = 0;

  constructor(...items: T[]) {
    for (let i = 0; i < items.length; i++) {
      this.enqueue(items[i]);
    }
  }

  clear() {
    this.head = undefined;
    this.last = undefined;
    this.size = 0;
  }

  enqueue(item: T) {
    const link = { value: item, next: undefined };
    if (this.head) {
      let x = this.head;
      while (x.next) {
        x = x.next;
      }
      x.next = link;
    } else {
      this.head = link;
    }
    this.size += 1;
  }

  dequeue() {
    if (!this.head) {
      return;
    }
    const { value } = this.head;
    this.head = this.head.next;
    this.size -= 1;
    return value;
  }

  peek() {
    return this.head && this.head.value;
  }

  *iterator(length?: number) {
    length = length ?? this.size;
    for (let i = 0; i < length; i++) {
      yield this.dequeue();
    }
  }
}
