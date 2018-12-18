import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import { SQLite } from 'expo'

const db = SQLite.openDatabase('todo.db')

interface IState {
  todoText: string
  items: string[]
}

export default class App extends React.Component<{}, IState> {
  state = {
    todoText: '',
    items: [],
  }

  async componentDidMount() {
    try {
      db.transaction((tx: any) => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS items (todo_text text);')
        tx.executeSql(
          'SELECT todo_text FROM items',
          [],
          (_: any, { rows: { _array } }: any) =>
            this.setState({
              items: [
                ...this.state.items,
                ..._array.map(
                  (todoObj: { todo_text: any }) => todoObj.todo_text
                ),
              ],
            })
        )
      })
    } catch (error) {
      console.log(error)
    }
  }

  _insert = async () => {
    const { items, todoText } = this.state
    try {
      await this.setState({
        todoText: '',
        items: [...items, todoText],
      })
      await db.transaction((tx: any) => {
        tx.executeSql('INSERT INTO items (todo_text) VALUES (?)', [todoText])
      })
    } catch (error) {
      console.log(error)
    }
  }

  _delete = async (todoText: string) => {
    const index = (this.state.items as string[]).indexOf(todoText)
    this.state.items.splice(index, 1)
    try {
      await this.setState({ items: [...this.state.items] })
      await db.transaction((tx: any) => {
        console.log('todoText: ' + todoText)
        tx.executeSql('DELETE FROM items WHERE todo_text = ?', [todoText])
      })
    } catch (error) {
      console.log(error)
    }
  }

  _listItemRenderer = (item: string) => {
    return (
      <TouchableOpacity onPress={() => this._delete(item)}>
        <View style={styles.listItem}>
          <Text style={styles.itemText}>{item}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <TextInput
          style={styles.todosText}
          value={this.state.todoText}
          onChangeText={todo => this.setState({ todoText: todo })}
        />
        <FlatList
          style={styles.flatList}
          data={this.state.items}
          renderItem={({ item }) => this._listItemRenderer(item)}
          keyExtractor={(item, index) => index.toString()}
        />
        <Button title={'Add Todo'} onPress={this._insert} />
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todosText: {
    width: '90%',
    marginTop: 30,
    marginBottom: 16,
    borderBottomWidth: 2,
    fontSize: 20,
    justifyContent: 'center',
  },
  flatList: {
    width: '100%',
    flex: 1,
  },
  listItem: {
    backgroundColor: '#4286f4',
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    color: 'white',
    fontSize: 18,
  },
})
