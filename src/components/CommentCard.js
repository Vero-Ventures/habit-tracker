import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native';
import Colors from '../../assets/styles/Colors';
import { Image } from 'react-native';
import moment from 'moment';

export default function CommentCard({ commentData}) {
    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Image
                    style={styles.userIconPhoto}
                    source={{ uri: commentData.user_id.profile_image }}
                />
                <View>
                    <Text style={styles.textUserName}>{commentData.user_id.username}</Text>
                    <Text style={styles.textSubtitle}>
                        {moment(commentData.created_at).fromNow()}
                    </Text>
                </View> 
            </View>
            <Text style={styles.comment}>{commentData.content}</Text>
        </View>
    );
}

CommentCard.propTypes = {
    commentData: PropTypes.object,
};

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 7,
    },
    container: {
        backgroundColor: 'rgba(156, 198, 255, 0.042)',
        display: 'flex',
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 7,
        padding: 10,
        borderRadius: 8,
        margin: 5,
    },
    comment: {
        justifyContent: 'flex-start',
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 16,
        color: Colors.text,
        width: '100%',
        flexShrink: 1,
    },
    cardPostLinearGradientContainer: {
        flex: 1,
        backgroundColor: 'rgba(156, 198, 255, 0.042)',
      },
    textUserName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 16,
        color: Colors.text,
    },
    headerContainer: {
        display: 'flex',
        flexDirection: 'row',
        padding: 10,
      },
    userIconPhoto: {
        width: 38,
        height: 38,
        borderRadius: 32,
        marginRight: 8,
      },
      textSubtitle: {
        fontSize: 14,
        lineHeight: 19,
        fontWeight: '400',
        color: Colors.text,
      },
});

