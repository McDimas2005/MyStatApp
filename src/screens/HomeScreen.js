import React from 'react';
import { View, FlatList, Button, StyleSheet } from 'react-native';
import { useStats } from '../context/StatContext';
import StatCard from '../components/StatCard';

export default function HomeScreen({ navigation }) {
  const { stats } = useStats();
  return (
    <View style={styles.container}>
      <Button title="Add Stat" onPress={() => navigation.navigate('AddStat')} />
      <FlatList
        data={stats}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <StatCard {...item} progress={item.progress ?? item.total ?? 0} />
        )}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f9fd' },
});
