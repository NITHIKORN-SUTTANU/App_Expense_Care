import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

interface SwipeableRowProps {
    children: React.ReactNode;
    onDelete: () => void;
}

export function SwipeableRow({ children, onDelete }: SwipeableRowProps) {
    const renderRightActions = (progress: any, dragX: any) => {
        return (
            <TouchableOpacity
                style={styles.deleteAction}
                onPress={onDelete}
                activeOpacity={0.8}
            >
                <Ionicons name="trash-outline" size={24} color="#FFF" />
            </TouchableOpacity>
        );
    };

    return (
        <Swipeable renderRightActions={renderRightActions}>
            {children}
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    deleteAction: {
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
    },
});
