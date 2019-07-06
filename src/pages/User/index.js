import React, { Component } from 'react';
import PropTypes from 'prop-types';

import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Loading,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    page: 1,
    loading: true,
    refreshing: false,
  };

  async componentDidMount() {
    this.loadStars();
  }

  handlePageChange = async () => {
    const { page } = this.state;
    await this.setState({
      page: page + 1,
    });
    this.loadStars();
  };

  refreshList = async () => {
    await this.setState({
      page: 1,
      stars: [],
      refreshing: true,
    });
    this.loadStars();
  };

  handleNavigate = repository => {
    const { navigation } = this.props;

    navigation.navigate('Repo', { repository });
  };

  wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  async loadStars() {
    const { navigation } = this.props;
    const { page, stars } = this.state;
    const user = navigation.getParam('user');

    this.setState({
      loading: true,
    });

    const response = await api.get(`/users/${user.login}/starred`, {
      params: {
        page: page + 1,
      },
    });

    await this.wait(2000);

    this.setState({
      stars: [...stars, ...response.data],
      page: page + 1,
      loading: false,
      refreshing: false,
    });
  }

  render() {
    const { navigation } = this.props;
    const { stars, loading, refreshing } = this.state;
    const user = navigation.getParam('user');
    const loadingButNoRefreshing = loading && !refreshing;

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        <Stars
          data={stars}
          keyExtractor={star => String(star.id)}
          renderItem={({ item }) => (
            <Starred onPress={() => this.handleNavigate(item)}>
              <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
              <Info>
                <Title>{item.name}</Title>
                <Author>{item.owner.login}</Author>
              </Info>
            </Starred>
          )}
          onEndReachedThreshold={0.2}
          onEndReached={this.handlePageChange}
          onRefresh={this.refreshList}
          refreshing={refreshing}
        />
        {loadingButNoRefreshing ? <Loading /> : null}
      </Container>
    );
  }
}
