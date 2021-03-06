export default class Graph {
	constructor(nodes) {
		this.nodes = nodes || [];

		if (this.nodes.length === 0) {
			this.nodes.push(this.createNode(''));
		}

		this._update();
	}

	insertNode(parentId, name) {
		const parentNode = this.getNodeById(parentId);
		const newNode = this.createNode(name);

		parentNode.children.add(newNode.id);
		newNode.parents.add(parentNode.id);
		this.nodes.push(newNode);

		this._update();
	}

	deleteNodeHard(id) {
		const deletedNode = this.getNodeById(id);

		if (deletedNode.parents.size === 0) {
			throw Error('You can\'t delete root element');
		}

		deletedNode.children.forEach(childId => {
			this.deleteNodeHard(childId);
		});

		deletedNode.parents.forEach(parentId => {
			const parent = this.getNodeById(parentId);

			parent.children.delete(id);
		});

		this.nodes = this.nodes.filter(node => id !== node.id);

		this._update();

		return this.nodes;
	}

	deleteNodeSoft(id) {
		const deletedNode = this.getNodeById(id);

		if (deletedNode.parents.size === 0) {
			throw Error('You can\'t delete root element');
		}

		deletedNode.parents.forEach(parentId => {
			const parent = this.getNodeById(parentId);
			parent.children.delete(id);

			deletedNode.children.forEach(childId => {
				parent.children.add(childId);
			});
		});

		deletedNode.children.forEach(childId => {
			const child = this.getNodeById(childId);
			child.parents.delete(id);

			deletedNode.parents.forEach(parentId => {
				child.parents.add(parentId);
			})
		});

		this.nodes = [...this.nodes.filter(node => id !== node.id)];

		this._update();

		return this.nodes;
	}

	createNode(name) {
		return {
			id: this.getNewId(),
			name: name,
			left: 0,
			top: 0,
			width: 0,
			children: new Set(),
			parents: new Set()
		}
	}

	getNewId() {
		let maxId = 0;

		this.nodes.forEach(node => {
			if (node.id > maxId) {
				maxId = node.id;
			}
		});

		return maxId + 1;
	}

	getNodeById(id) {
		return this.nodes.find(node => node.id === id);
	}

	getRootNode() {
		return this.nodes.find(node => node.parents.size === 0);
	}

	_update() {
		const rootNode = this.getRootNode();
		const rootLeft = (window.innerWidth - rootNode.width)/2;

		this._calculateColumnWidth(rootNode.id);
		this._calculatePositions(rootNode.id, rootLeft, 100);
		this._calculateLevel(rootNode.id, 0);
	}

	_calculatePositions(nodeId, left, top) {
		const node = this.getNodeById(nodeId);
		node.left = left + node.width/2 - 50;
		node.top = top;

		let childLeft = left;
		let childTop = top + 120;
		node.children.forEach(childId => {
			const childNode = this.getNodeById(childId);
			this._calculatePositions(childId, childLeft, childTop);
			childLeft += childNode.width;
		});
	}

	_calculateColumnWidth(nodeId) {
		const curNode = this.getNodeById(nodeId);
		curNode.width = 0;

		if (curNode.children.size === 0) {
			curNode.width = 80;
			return 80;
		} else {
			curNode.children.forEach(childId => {
				this._calculateColumnWidth(childId);
				const child = this.getNodeById(childId);

				curNode.width += child.width;
			})
		}
	}

	_calculateLevel(nodeId, level) {
		const node = this.getNodeById(nodeId);
		node.level = level;

		node.children.forEach(childId => {
			this._calculateLevel(childId, level + 1);
		});
	}

	setPosition(id, x, y) {
		const node = this.getNodeById(id);

		node.left = x;
		node.top = y;
	}
}