import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Animated, 
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';

const MainScreen = ({ 
  tasks, 
  deleteTask, 
  toggleTaskCompletion, 
  editTask, 
  isDarkMode,
  navigation 
}) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);

  const filters = ['All', 'Completed', 'Active'];
  const categories = ['Work', 'Personal', 'Shopping', 'Health', 'Other'];
  const priorities = ['Low', 'Medium', 'High'];

  const filteredTasks = tasks.filter(task => {
    // Apply status filter
    if (activeFilter === 'Completed' && !task.completed) return false;
    if (activeFilter === 'Active' && task.completed) return false;
    
    // Apply priority filter
    if (priorityFilter && task.priority !== priorityFilter) return false;
    
    // Apply category filter
    if (categoryFilter && task.category !== categoryFilter) return false;
    
    return true;
  });

  const clearFilters = () => {
    setActiveFilter('All');
    setPriorityFilter(null);
    setCategoryFilter(null);
  };

  const showDeleteConfirmation = (id) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => deleteTask(id),
          style: "destructive"
        }
      ]
    );
  };

  const renderRightActions = (progress, dragX, id) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [0, 0, 0, 1],
    });
     
    
    return (
      <RectButton 
        style={[
          styles.deleteButton, 
          isDarkMode ? styles.darkDeleteButton : styles.lightDeleteButton
        ]}
        onPress={() => showDeleteConfirmation(id)}
      >
        <Animated.Text
          style={[
            styles.deleteButtonText,
            {
              transform: [{ translateX: trans }],
            },
          ]}
        >
          <Ionicons name="trash" size={24} color="#fff" />
        </Animated.Text>
      </RectButton>
    );
  };
  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={(progress, dragX) => 
        renderRightActions(progress, dragX, item.id)
      }
      friction={2}
      rightThreshold={40}
    >
      <View
        style={[
          styles.taskItem,
          isDarkMode ? styles.darkTaskItem : styles.lightTaskItem,
          item.completed && styles.completedTask,
        ]}
      >
        <TouchableOpacity
          style={styles.taskContent}
          onPress={() => toggleTaskCompletion(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={getCategoryColor(item.category)}
            style={styles.taskIcon}
          />
          <View style={styles.taskTextContainer}>
            <Text
              style={[
                styles.taskText,
                isDarkMode ? styles.darkText : styles.lightText,
                item.completed && styles.completedText,
              ]}
              numberOfLines={2}
            >
              {item.text}
            </Text>
            <View style={styles.taskMeta}>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(item.priority) },
                ]}
              >
                <Text style={styles.priorityText}>{item.priority}</Text>
              </View>
              <Text
                style={[
                  styles.categoryText,
                  { color: getCategoryColor(item.category) },
                ]}
              >
                {item.category}
              </Text>
              {item.dueDate && (
                <Text
                  style={[
                    styles.dueDateText,
                    isDarkMode ? styles.darkSecondaryText : styles.lightSecondaryText,
                  ]}
                >
                  {formatDate(item.dueDate)}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.editButton, isDarkMode ? styles.darkEditButton : styles.lightEditButton]}
          onPress={() => navigation.navigate('AddTask', { taskToEdit: item })}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={24} color={isDarkMode ? '#fff' : '#000'} />
        </TouchableOpacity>
      </View>
    </Swipeable>
  );

  return (
    <View
      style={[
        styles.container,
        isDarkMode ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      {/* Filter Controls */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {/* Status Filters */}
        {filters.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && styles.activeFilter,
              isDarkMode ? styles.darkFilterButton : styles.lightFilterButton,
              activeFilter === filter && {
                backgroundColor: isDarkMode ? '#444' : '#ddd',
              }
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              isDarkMode ? styles.darkFilterText : styles.lightFilterText,
              activeFilter === filter && styles.activeFilterText
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Priority Filters */}
        {priorities.map(priority => (
          <TouchableOpacity
            key={priority}
            style={[
              styles.filterButton,
              priorityFilter === priority && styles.activeFilter,
              isDarkMode ? styles.darkFilterButton : styles.lightFilterButton,
              priorityFilter === priority && {
                backgroundColor: getPriorityColor(priority),
                opacity: 0.8
              }
            ]}
            onPress={() => setPriorityFilter(priorityFilter === priority ? null : priority)}
          >
            <Text style={[
              styles.filterText,
              isDarkMode ? styles.darkFilterText : styles.lightFilterText,
              priorityFilter === priority && styles.activeFilterText
            ]}>
              {priority}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Category Filters */}
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterButton,
              categoryFilter === category && styles.activeFilter,
              isDarkMode ? styles.darkFilterButton : styles.lightFilterButton,
              categoryFilter === category && {
                backgroundColor: getCategoryColor(category),
                opacity: 0.8
              }
            ]}
            onPress={() => setCategoryFilter(categoryFilter === category ? null : category)}
          >
            <Text style={[
              styles.filterText,
              isDarkMode ? styles.darkFilterText : styles.lightFilterText,
              categoryFilter === category && styles.activeFilterText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}

        {(priorityFilter || categoryFilter || activeFilter !== 'All') && (
          <TouchableOpacity
            style={[
              styles.filterButton,
              styles.clearFilterButton,
              isDarkMode ? styles.darkClearFilterButton : styles.lightClearFilterButton
            ]}
            onPress={clearFilters}
          >
            <Ionicons 
              name="close" 
              size={16} 
              color={isDarkMode ? '#fff' : '#333'} 
            />
          </TouchableOpacity>
        )}
      </ScrollView>

      {filteredTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="filter"
            size={60}
            color={isDarkMode ? '#555' : '#ccc'}
          />
          <Text
            style={[
              styles.emptyText,
              isDarkMode ? styles.darkSecondaryText : styles.lightSecondaryText,
            ]}
          >
            No tasks match your filters
          </Text>
          {(priorityFilter || categoryFilter || activeFilter !== 'All') && (
            <TouchableOpacity
              style={[
                styles.clearAllButton,
                isDarkMode ? styles.darkClearAllButton : styles.lightClearAllButton
              ]}
              onPress={clearFilters}
            >
              <Text style={[
                styles.clearAllText,
                isDarkMode ? styles.darkClearAllText : styles.lightClearAllText
              ]}>
                Clear Filters
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const getCategoryColor = (category) => {
  const colors = {
    Work: "#FF5722",
    Personal: "#2196F3",
    Shopping: "#4CAF50",
    Health: "#E91E63",
    Other: "#9C27B0",
  };
  return colors[category] || "#607D8B";
};

const getPriorityColor = (priority) => {
  const colors = {
    Low: "#4CAF50",
    Medium: "#FFC107",
    High: "#F44336",
  };
  return colors[priority] || "#FFC107";
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  lightContainer: {
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  filterContainer: {
    marginTop: 16,
    marginBottom: 8,
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  lightFilterButton: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  darkFilterButton: {
    backgroundColor: '#333',
    borderColor: '#444',
  },
  activeFilter: {
    borderWidth: 0,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  lightFilterText: {
    color: '#333',
  },
  darkFilterText: {
    color: '#fff',
  },
  activeFilterText: {
    color: '#fff',
  },
  clearFilterButton: {
    padding: 6,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightClearFilterButton: {
    backgroundColor: '#fff',
  },
  darkClearFilterButton: {
    backgroundColor: '#333',
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    textAlign: 'center',
  },
  taskItem: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lightTaskItem: {
    backgroundColor: '#fff',
  },
  darkTaskItem: {
    backgroundColor: '#1E1E1E',
  },
  completedTask: {
    opacity: 0.7,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskIcon: {
    marginRight: 16,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    marginBottom: 4,
  },
  lightText: {
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  priorityBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    marginBottom: 4,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
    marginBottom: 4,
  },
  dueDateText: {
    fontSize: 12,
    marginBottom: 4,
  },
  lightSecondaryText: {
    color: '#666',
  },
  darkSecondaryText: {
    color: '#aaa',
  },
  deleteButton: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
  },
  lightDeleteButton: {
    backgroundColor: '#ff4444',
  },
  darkDeleteButton: {
    backgroundColor: '#d32f2f',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    padding: 10,
  },
  editButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 8,
    borderRadius: 20,
  },
  lightEditButton: {
    backgroundColor: '#f0f0f0',
  },
  darkEditButton: {
    backgroundColor: '#333',
  },
  clearAllButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  lightClearAllButton: {
    backgroundColor: '#e0e0e0',
  },
  darkClearAllButton: {
    backgroundColor: '#333',
  },
  clearAllText: {
    fontWeight: '600',
  },
  lightClearAllText: {
    color: '#333',
  },
  darkClearAllText: {
    color: '#fff',
  },
});

export default MainScreen;