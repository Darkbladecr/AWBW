type ScoreFunction = (x: any) => number;

export class BinaryHeap<T> {
  content: T[] = [];
  scoreFn: ScoreFunction;

  constructor(scoreFn: ScoreFunction) {
    this.scoreFn = scoreFn;
  }
  push(node: T) {
    this.content.push(node);
    this.sinkDown(this.content.length - 1);
  }
  pop() {
    const result = this.content[0];
    const end = this.content.pop();
    if (end && this.content.length > 0) {
      this.content[0] = end;
      this.bubbleUp(0);
    }
    return result;
  }
  remove(node: T) {
    const i = this.content.indexOf(node);
    const end = this.content.pop();

    if (end && i !== this.content.length - 1) {
      this.content[i] = end;

      if (this.scoreFn(end) < this.scoreFn(node)) {
        this.sinkDown(i);
      } else {
        this.bubbleUp(i);
      }
    }
  }
  get size() {
    return this.content.length;
  }
  rescore(node: T) {
    this.sinkDown(this.content.indexOf(node));
  }
  sinkDown(index: number) {
    const node = this.content[index];
    while (index > 0) {
      // compute the parent element's index and fetch it
      const parentIdx = ((index + 1) >> 1) - 1;
      const parent = this.content[parentIdx];
      // swap the elments if the parent is greater
      if (this.scoreFn(node) < this.scoreFn(parent)) {
        this.content[parentIdx] = node;
        this.content[index] = parent;
        index = parentIdx;
      } else {
        // found a parent that is less, no need to sink any further
        break;
      }
    }
  }
  bubbleUp(index: number) {
    const length = this.size;
    const node = this.content[index];
    const nodeScore = this.scoreFn(node);

    while (true) {
      // compute the indices of the child elements
      const child2Idx = (index + 1) << 1;
      const child1Idx = child2Idx - 1;
      let swap: number = -1;
      let child1Score: number = -1;
      if (child1Idx < length) {
        const child1 = this.content[child1Idx];
        child1Score = this.scoreFn(child1);

        if (child1Score < nodeScore) {
          swap = child1Idx;
        }
      }

      if (child2Idx < length) {
        const child2 = this.content[child2Idx];
        const child2Score = this.scoreFn(child2);
        if (child2Score < (swap === -1 ? nodeScore : child1Score)) {
          swap = child2Idx;
        }
      }

      if (swap !== -1) {
        this.content[index] = this.content[swap];
        this.content[swap] = node;
        index = swap;
      } else {
        break;
      }
    }
  }
}
