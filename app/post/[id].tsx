import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Post() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const post = {
    id,
    title: `Пост #${id}`,
    author: "Art4House",
    image: `https://picsum.photos/800/800?random=${id}`,
    description: "Полный текст описания работы...",
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:'#fff' }}>
      <View style={{ padding:16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color:'#2b6cb0' }}>Закрыть</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={{ padding:16 }}>
          <Image source={{ uri: post.image }} style={{ width:'100%', height:400, borderRadius:8 }} />
          <Text style={{ fontSize:20, fontWeight:'700', marginTop:12 }}>{post.title}</Text>
          <Text style={{ color:'#4a5568', marginTop:6 }}>{post.author}</Text>
          <Text style={{ marginTop:12 }}>{post.description}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
