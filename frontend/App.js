import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import MainScreen from './screens/MainScreen';
import AddTaskScreen from './screens/AddTaskScreen';

const Stack = createStackNavigator();

const BACKEND_URL = 'https://todo-expo-backend.onrender.com';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tasks, setTasks] = useState([]);
  const spinValue = new Animated.Value(0);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Fetch tasks from backend on mount
  useEffect(() => {
    fetchTasksFromBackend();
  }, []);

  const fetchTasksFromBackend = async () => {
    try {
      const response = await fetch(BACKEND_URL + '/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to load tasks from server.');
    }
  };

  const toggleDarkMode = () => {
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: true
    }).start(() => spinValue.setValue(0));
    
    setIsDarkMode(!isDarkMode);
  };

  const addTask = async (task) => {
    try {
      const response = await fetch(BACKEND_URL + '/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)
      });
      if (!response.ok) {
        throw new Error('Failed to add task');
      }
      const newTask = await response.json();
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task.');
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(BACKEND_URL + '/tasks/' + id, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task.');
    }
  };

  const toggleTaskCompletion = async (id) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      const updatedTask = { ...task, completed: !task.completed };
      const response = await fetch(BACKEND_URL + '/tasks/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTask)
      });
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      const returnedTask = await response.json();
      setTasks(tasks.map(t => t.id === id ? returnedTask : t));
    } catch (error) {
      console.error('Error toggling task completion:', error);
      Alert.alert('Error', 'Failed to update task.');
    }
  };

  const editTask = async (id, updatedTaskData) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      const updatedTask = { ...task, ...updatedTaskData };
      const response = await fetch(BACKEND_URL + '/tasks/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTask)
      });
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      const returnedTask = await response.json();
      setTasks(tasks.map(t => t.id === id ? returnedTask : t));
    } catch (error) {
      console.error('Error editing task:', error);
      Alert.alert('Error', 'Failed to update task.');
    }
  };

  return (
    <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack.Navigator>
        <Stack.Screen 
          name="Main" 
          options={({ navigation }) => ({
            headerRight: () => (
              <View style={styles.headerRight}>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('AddTask')}
                  style={[styles.addButton, isDarkMode ? styles.darkAddButton : styles.lightAddButton]}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="add" 
                    size={24} 
                    color={isDarkMode ? '#fff' : '#000'} 
                  />
                </TouchableOpacity>
                <Animated.View style={[styles.themeToggleContainer, { transform: [{ rotate: spin }] }]}>
                  <TouchableOpacity 
                    onPress={toggleDarkMode} 
                    style={[styles.themeButton, isDarkMode ? styles.darkThemeButton : styles.lightThemeButton]}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={isDarkMode ? 'sunny' : 'moon'} 
                      size={20} 
                      color={isDarkMode ? '#fff' : '#000'} 
                    />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            ),
            title: 'My Tasks',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 24,
              color: isDarkMode ? '#fff' : '#000',
            },
            headerStyle: {
              backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
              elevation: 0,
              shadowOpacity: 0,
            },
          })}
        >
          {props => (
            <MainScreen 
              {...props} 
              tasks={tasks} 
              deleteTask={deleteTask} 
              toggleTaskCompletion={toggleTaskCompletion}
              editTask={editTask}
              isDarkMode={isDarkMode}
            />
          )}
        </Stack.Screen>
        <Stack.Screen 
          name="AddTask" 
          options={{
            title: 'Add New Task',
            headerBackTitle: 'Back',
            headerTitleStyle: {
              color: isDarkMode ? '#fff' : '#000',
            },
            headerStyle: {
              backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: isDarkMode ? '#fff' : '#000',
          }}
        >
          {props => (
            <AddTaskScreen 
              {...props} 
              addTask={addTask} 
              editTask={editTask}
              isDarkMode={isDarkMode}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    marginRight: 15,
    alignItems: 'center',
  },
  themeToggleContainer: {
    marginLeft: 15,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkThemeButton: {
    backgroundColor: '#333',
  },
  lightThemeButton: {
    backgroundColor: '#f0f0f0',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkAddButton: {
    backgroundColor: '#333',
  },
  lightAddButton: {
    backgroundColor: '#f0f0f0',
  },
});
