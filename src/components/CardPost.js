import { supabase } from '../config/supabaseClient';

// Example function for liking a post
const likePost = async postId => {
  const { data, error } = await supabase
    .from('Like')
    .insert([{ post_id: postId, user_id: session.user.id }]);

  if (error) throw error;
  return data;
};

// Example function for saving a post
const savePost = async postId => {
  const { data, error } = await supabase
    .from('SavedPost')
    .insert([{ post_id: postId, user_id: session.user.id }]);

  if (error) throw error;
  return data;
};

// Example function for deleting a post
const deletePost = async postId => {
  const { error } = await supabase.from('Post').delete().eq('id', postId);

  if (error) throw error;
};
