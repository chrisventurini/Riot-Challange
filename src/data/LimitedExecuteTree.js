/**
 * Given that the requirements of the leaderboard are to have the
 *  top ten drivers, a binary tree is the most performant when querying
 *  for values in a sorted order. This adds functionality to the dragon-bst
 *  library to be able to traverse the tree in reverse order, in addition to short circuit
 *  execution to stop after 10 keys have been returned.
 */
const AVLTree = require('@recrosoftware/dragon-bst').AVLTree;

/**
 * A child class that extends the functionality of the AVLTree
 *  that allows a reverse traversal of the tree with the ability to
 *  stop with a return of false.
 */
class LimitedExecuteTree extends AVLTree {

    /**
     * Executes a function on every node of the tree in reverse order
     * @param action {function} - the function that ever tree key its related data will
     * be passed to. Should return true if tree traversal should continue and false if not.
     */
    executeOnEveryNodeReverse(action)  {
        let actionResult = true;

        /**
         * Recursive function that traverses the
        *  tree in reverse order. Ends execution if
        *  the action returns false.
        */
        let executeNode = (node) => {
            if (node.right) {
                executeNode(node.right);
            }

            if(!actionResult)
                return;

            actionResult = action(node.key, node.data);

            if (node.left) {
                executeNode(node.left);
            }
        };

        // There is an internal tree that is assigned to the AVL property
        //  this where the data is actually stored
        executeNode(this.avl);
   }

}

module.exports = LimitedExecuteTree;
