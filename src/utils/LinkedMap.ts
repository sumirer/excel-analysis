export class LinkedNode<N> {
  public root: LinkedNode<N> | null = null;

  public next: LinkedNode<N> | null = null;

  public before: LinkedNode<N> | null = null;

  public node: N | null = null;

  public getRoot(): LinkedNode<N> | null {
    return this.root;
  }

  public getNext(): LinkedNode<N> | null {
    return this.next;
  }

  public setNext(next: LinkedNode<N>): void {
    this.next = next;
  }

  public removeNext(): void {
    this.next = null;
  }

  public getBefore(): LinkedNode<N> | null {
    return this.before;
  }

  public setBefore(before: LinkedNode<N>): void {
    this.before = before;
  }

  public removeBefore(): void {
    this.before = null;
  }

  public getNode(): N | null {
    return this.node;
  }

  public setNode(node: N): void {
    this.node = node;
  }

  /**
   * 移除当前节点
   * @param autoLink 是否自动连接前面和后面的节点
   */
  public removeNode(autoLink: boolean): void {
    if (autoLink) {
      const next = this.getNext();
      if (next) {
        this.getBefore()?.setNext(next);
      }
    } else {
      this.getBefore()?.removeNext();
    }
  }

  *[Symbol.iterator](): Generator<N | null> {
    let cursor: LinkedNode<N> | null = this.getRoot();
    while (cursor) {
      yield cursor.getNode();
      cursor = cursor.getNext();
    }
  }
}
