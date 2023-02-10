class LinkedNode<N> {
  constructor(public node: N | null, root = false) {
    this.isRoot = root;
  }

  public isRoot = false;

  public root: LinkedNode<N> | null = null;

  public next: LinkedNode<N> | null = null;

  public before: LinkedNode<N> | null = null;

  public getRoot(): LinkedNode<N> | null {
    return this.root;
  }

  public getNext(): LinkedNode<N> | null {
    return this.next;
  }

  public setNext(next: LinkedNode<N> | null): void {
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

  public getNode(): LinkedNode<N> {
    return this;
  }

  public getValue(): N | null {
    return this.node;
  }

  public setNodeValue(node: N): void {
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
}

export class LinkedMap<T> {
  private root?: LinkedNode<T>;

  private first?: LinkedNode<T>;

  private last?: LinkedNode<T>;

  public get firstNode(): T | undefined | null {
    return this.first?.getValue();
  }

  public get lastNode(): T | undefined | null {
    return this.last?.getValue();
  }

  public addNode(node: T): void {
    const linkedNode = new LinkedNode<T>(node);
    if (!this.root) {
      linkedNode.isRoot = true;
      this.root = linkedNode;
      this.first = linkedNode;
      this.last = linkedNode;
    } else {
      this.last?.setNext(linkedNode);
      this.last = linkedNode;
    }
  }

  public unshiftNode(node: T): void {
    if (!this.root) {
      this.addNode(node);
      return;
    }
    const linkedNode = new LinkedNode<T>(node, true);
    if (this.first) {
      linkedNode.setNext(this.first);
      this.first.isRoot = false;
      this.first = linkedNode;
    }
  }

  public afterInsert(targetNode: T, node: T): void {
    if (!this.root) {
      this.addNode(node);
    }
    for (const getNode of this) {
      if (getNode?.getValue() == targetNode) {
        const nextNode = new LinkedNode<T>(node);
        nextNode.setNext(getNode.getNext());
        getNode.setNext(nextNode);
        if (this.last === getNode && getNode) {
          this.last = nextNode;
        }
        break;
      }
    }
  }

  public beforeInsert(targetNode: T, node: T): void {
    if (!this.root) {
      this.addNode(node);
    }
    for (const getNode of this) {
      if (getNode?.getValue() == targetNode) {
        const beforeNode = getNode.getBefore();
        if (beforeNode) {
          const nextNode = new LinkedNode<T>(node);
          nextNode.setNext(getNode);
          beforeNode.setNext(nextNode);
          if (this.first === getNode && getNode) {
            getNode.isRoot = false;
            nextNode.isRoot = true;
            this.first = nextNode;
          }
        }
        break;
      }
    }
  }

  public removeNode(node: T, autoLink: boolean): void {
    if (!this.root) {
      return;
    }
    for (const getNode of this) {
      if (getNode?.getValue() == node && getNode) {
        getNode.removeNode(autoLink);
        break;
      }
    }
  }

  *[Symbol.iterator](): Generator<LinkedNode<T> | null> {
    if (!this.root) {
      return;
    }
    let cursor: LinkedNode<T> | null = this.root;
    while (cursor) {
      yield cursor.getNode();
      cursor = cursor.getNext();
    }
  }
}
