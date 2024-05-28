import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import PropTypes from 'prop-types';
import { supabase } from '../../config/supabaseClient';
import Header from '../../components/Header';
import CommentCard from '../../components/CommentCard';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import Colors from '../../../assets/styles/Colors';
import { Input } from 'react-native-elements';
import Default from '../../../assets/styles/Default';
import { TouchableOpacity } from 'react-native-gesture-handler';
import store from '../../store/storeConfig';

export default function CommentsScreen({ route }) {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');
    const postId = route.params.postId;
    const [isAddingComment, setIsAddingComment] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: commentData, error } = await supabase
                .from('Comments')
                .select('*, user_id(*)')
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

                if (error) {
                    throw error;
                }
                setComments(commentData);
            } catch (error) {
                console.log('error', error);
            }
        }
        fetchData();
    }, [comments.length]);

    const addComment = async () => {
        if (isAddingComment) {
            try {
                const { data: commentInsertData, error: commentInsertError} = await supabase
                .from('Comments')
                .insert([{ user_id: store.getState().user.session.user.id, post_id: postId, content: comment }])
                .select();

                setComment('');
                setIsAddingComment(false);
                setComments([...comments, commentInsertData[0]]);
            } catch (error) {
                console.log('error:', error);
            }
        } 
    };    

    const toggleCommenting = () => {
        setComment('');
        setIsAddingComment(!isAddingComment);
    };



    const commentListFooter = () => {
        return (
            <TouchableOpacity style={styles.addButton} onPress={toggleCommenting}>
                <Icon name="plus" size={24} style={styles.buttonIcon} />
            </TouchableOpacity>
        );
    }



    return (
        <View style={styles.container}>
            <Header navigation={route.params.navigation} backButton title="Comments" />
            <View style={styles.postContainer}>
                <View style={styles.postHeader}>
                    <Image source={{ uri: route.params.userData.imageUrl }} style={styles.userImage} />
                    <Text style={styles.textUserName}>{route.params.userData.name}</Text>
                </View>
                <Text style={styles.postText}>{route.params.postData.description}</Text>
            </View>
            {isAddingComment ? 
            <ScrollView>
                <Input
                    placeholder="Add a comment"
                    value={comment}
                    onChangeText={setComment}
                    label="Comment"
                    keyboardAppearance="dark"
                    autoFocus={true}
                    autoCorrect={true}
                    returnKeyType="next"
                    placeholderTextColor="#455c8a"
                    containerStyle={Default.containerInput}
                    inputStyle={Default.loginInput}
                    inputContainerStyle={Default.loginInputContainer}
                    labelStyle={Default.loginInputLabel}
                    style={styles.commentInput}
                    multiline={true}
                />
                <View style={styles.addCommentButtonContainer} >
                    <TouchableOpacity style={styles.addButton} onPress={addComment}>
                        <Text style={styles.buttonText}>Add Comment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={toggleCommenting}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            :
            <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <CommentCard commentData={item} />
                )}
                contentContainerStyle={styles.list}
                ListFooterComponent={commentListFooter}
            />}
        </View>
    );
}

CommentsScreen.propTypes = {
    postId: PropTypes.string,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    postContainer: {
        padding: 16,
        backgroundColor: 'rgba(156, 198, 255, 0.25)',
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 8,
    },
    postHeader: {
        display: 'flex',
        flexDirection: 'row',
    },
    container: {
        flex: 1,
    },
    list: {
        padding: 16,
    },
    addButton: {
        flex: 1,
        width: '100%',
        backgroundColor: 'blue',
        padding: 16,
        borderRadius: 50,
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        width: '100%',
        backgroundColor: 'red',
        padding: 16,
        borderRadius: 50,
        marginTop: 16,
    },
    buttonText: {
        color: Colors.text,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '700',
    },
    buttonIcon: {
        color: 'white',
        textAlign: 'center',
    },
    userImage: {
        width: 38,
        height: 38,
        borderRadius: 32,
        marginRight: 8,
    },
    postText: {
        justifyContent: 'flex-start',
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 16,
        color: Colors.text,
        width: '100%',
        flexShrink: 1,
        paddingLeft: 15,
        paddingTop: 15,
      },
    textUserName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 16,
        color: Colors.text,
    },
    commentInput: {
        padding: 8,
        paddingTop: 16,
        width: '100%',
        backgroundColor: 'rgba(156, 198, 255, 0.05)',
        borderRadius: 8,
        marginLeft: 10,
        marginRight: 10,
    },
    addCommentButtonContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        padding: 10,
    },
});

