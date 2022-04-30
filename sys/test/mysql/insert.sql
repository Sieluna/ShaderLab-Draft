USE shaderlab;

/* Create users from TestName1-5 */

INSERT INTO users (user_name, user_avatar, user_email, user_password, user_introduction) VALUES ('TestName1', 'TestName1UserAvatarData', '123456789@mail.com', '12345', 'My name is Test Name 1');

INSERT INTO users (user_name, user_avatar, user_email, user_password, user_introduction) VALUES ('TestName2', 'TestName2UserAvatarData', '123456789@mail.com', '12345', 'My name is Test Name 2');

INSERT INTO users (user_name, user_avatar, user_email, user_password, user_introduction) VALUES ('TestName3', 'TestName3UserAvatarData', '123456789@mail.com', '12345', 'My name is Test Name 3');

INSERT INTO users (user_name, user_avatar, user_email, user_password, user_introduction) VALUES ('TestName4', 'TestName4UserAvatarData', '123456789@mail.com', '12345', 'My name is Test Name 4');

INSERT INTO users (user_name, user_avatar, user_email, user_password, user_introduction) VALUES ('TestName5', 'TestName5UserAvatarData', '123456789@mail.com', '12345', 'My name is Test Name 5');

/* Create topics from TopicName1-5 */

INSERT INTO topics (topic_name, topic_image, topic_description) values ('TestTopicName1', 'TestTopicName1ImageData', 'This is a Topic Name 1');

INSERT INTO topics (topic_name, topic_image, topic_description) values ('TestTopicName2', 'TestTopicName2ImageData', 'This is a Topic Name 2');

INSERT INTO topics (topic_name, topic_image, topic_description) values ('TestTopicName3', 'TestTopicName3ImageData', 'This is a Topic Name 3');

INSERT INTO topics (topic_name, topic_image, topic_description) values ('TestTopicName4', 'TestTopicName4ImageData', 'This is a Topic Name 4');

INSERT INTO topics (topic_name, topic_image, topic_description) values ('TestTopicName5', 'TestTopicName5ImageData', 'This is a Topic Name 5');

/* Create posts from TestName1-5 under TestTopicName1 */

INSERT INTO posts (post_name, post_content, post_topic, post_user) VALUES ('TestPostName1', '123456789', 1, 1);

INSERT INTO posts (post_name, post_content, post_topic, post_user) VALUES ('TestPostName1', '123456789', 1, 2);

INSERT INTO posts (post_name, post_content, post_topic, post_user) VALUES ('TestPostName1', '123456789', 1, 3);

INSERT INTO posts (post_name, post_content, post_topic, post_user) VALUES ('TestPostName1', '123456789', 1, 4);

INSERT INTO posts (post_name, post_content, post_topic, post_user) VALUES ('TestPostName1', '123456789', 1, 5);

/* Mark tags upon TestPostName1 Test */

INSERT INTO tags (tag_name, tag_post) VALUES ('TestTagName1', 1);

INSERT INTO tags (tag_name, tag_post) VALUES ('TestTagName2', 1);

INSERT INTO tags (tag_name, tag_post) VALUES ('TestTagName3', 1);

INSERT INTO tags (tag_name, tag_post) VALUES ('TestTagName4', 1);

INSERT INTO tags (tag_name, tag_post) VALUES ('TestTagName5', 1);

/* Mark ta */