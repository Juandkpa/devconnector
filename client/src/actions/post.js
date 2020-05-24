import axios from 'axios';
import { setAlert } from './alert';
import {
    GET_POSTS,
    POST_ERROR,
    UPDATE_LIKES,
    DELETE_POST,
    ADD_POST,
    GET_POST,
    ADD_COMMENT,
    REMOVE_COMMENT
} from './types';

export const getPosts = () => async dispatch => {
    try {
        const res = await axios.get('/api/post');

        dispatch({
            type: GET_POSTS,
            payload: res.data
        });
    } catch(error) {
        dispatch({
            type: POST_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status }
        });
    }
};

export const addLike = postId => async dispatch => {
    try {
        const res = await axios.put(`/api/post/like/${postId}`);

        dispatch({
            type: UPDATE_LIKES,
            payload: {id: postId, likes: res.data }
        });
    }catch (error) {
        dispatch({
            type: POST_ERROR,
            payload: { msg: error.response.statusText, status: error.response.statusText }
        });
    }
};

export const removeLike = postId => async dispatch => {
    try {
        const res = await axios.put(`/api/post/unlike/${postId}`);

        dispatch({
            type: UPDATE_LIKES,
            payload: {id: postId, likes: res.data }
        });
    }catch (error) {
        dispatch({
            type: POST_ERROR,
            payload: { msg: error.response.statusText, status: error.response.statusText }
        });
    }
};

export const deletePost = postId => async dispatch => {
    try {
        await axios.delete(`/api/post/${postId}`);

        dispatch({
            type: DELETE_POST,
            payload: postId
        });

        dispatch(setAlert('Post Removed', 'success'));
    }catch (error) {
        dispatch({
            type: POST_ERROR,
            payload: { msg: error.response.statusText, status: error.response.statusText }
        });
    }
}


export const addPost = formData => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.post('/api/post/', formData, config);

        dispatch({
            type: ADD_POST,
            payload: res.data
        });

        dispatch(setAlert('Post Created', 'success'));
    }catch (error) {
        dispatch({
            type: POST_ERROR,
            payload: { msg: error.response.statusText, status: error.response.statusText }
        });
    }
};

export const getPost = id => async dispatch => {
    try {
        const res = await axios.get(`/api/post/${id}`);

        dispatch({
            type: GET_POST,
            payload: res.data
        });
    } catch(error) {
        dispatch({
            type: POST_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status }
        });
    }
};

export const addComment = (postId, formData) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.post(`/api/post/comment/${postId}`, formData, config);
        dispatch({
            type: ADD_COMMENT,
            payload: res.data
        });

        dispatch(setAlert('Comment added', 'success'));
    }catch (error) {
        dispatch({
            type: POST_ERROR,
            payload: { msg: error.response.statusText, status: error.response.statusText }
        });
    }
};

export const deleteComment = (postId, commentId) => async dispatch => {

    try {
        await axios.delete(`/api/post/comment/${postId}/${commentId}`);

        dispatch({
            type: REMOVE_COMMENT,
            payload: commentId
        });

        dispatch(setAlert('Comment removed', 'success'));
    }catch (error) {
        dispatch({
            type: POST_ERROR,
            payload: { msg: error.response.statusText, status: error.response.statusText }
        });
    }
};