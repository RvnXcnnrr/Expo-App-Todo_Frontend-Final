// App.js
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableOpacity, Animated, Easing } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainScreen from './screens/MainScreen';
import AddTaskScreen from './screens/AddTaskScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tasks, setTasks] = useState([]);
  const spinValue = new Animated.Value(0);

  // Animation for theme toggle
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Load saved tasks and theme preference
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedTasks, savedTheme] = await Promise.all([
          AsyncStorage.getItem('tasks'),
          AsyncStorage.getItem('isDarkMode')
        ]);
        
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedTheme) setIsDarkMode(savedTheme === 'true');
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  // Save tasks and theme preference
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.multiSet([
          ['tasks', JSON.stringify(tasks)],
          ['isDarkMode', isDarkMode.toString()]
        ]);
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };
    
    saveData();
  }, [tasks, isDarkMode]);

  const toggleDarkMode = () => {
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: true
    }).start(() => spinValue.setValue(0));
    
    setIsDarkMode(!isDarkMode);
  };

  const addTask = (task) => {
    setTasks([...tasks, task]);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTaskCompletion = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const editTask = (id, updatedTask) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updatedTask } : task
    ));
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

// Removed duplicate export default statement