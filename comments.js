// Create web server for commentings

// Import modules
const express = require('express');
const router = express.Router();
const Comment = require('../models/comments');
const Post = require('../models/posts');
const User = require('../models/users');
const auth = require('../middlewares/auth');

// Create comment
router.post('/post/:id', auth, async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id });
        if (!post) {
            return res.status(404).send({ error: 'Post not found' });
        }
        const comment = await Comment.create({
            content: req.body.content,
            post: req.params.id,
            user: req.user._id
        });
        post.comments.push(comment._id);
        await post.save();
        return res.status(201).send(comment);
    } catch (error) {
        return res.status(500).send({ error: 'Internal server error' });
    }
});

// Edit comment
router.patch('/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findOne({ _id: req.params.id });
        if (!comment) {
            return res.status(404).send({ error: 'Comment not found' });
        }
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        comment.content = req.body.content;
        await comment.save();
        return res.status(200).send(comment);
    } catch (error) {
        return res.status(500).send({ error: 'Internal server error' });
    }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findOne({ _id: req.params.id });
        if (!comment) {
            return res.status(404).send({ error: 'Comment not found' });
        }
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        const post = await Post.findOne({ _id: comment.post });
        post.comments = post.comments.filter(comment => comment.toString() !== req.params.id.toString());
        await post.save();
        await comment.remove();
        return res.status(200).send({ message: 'Comment deleted' });
    } catch (error) {