/**
 * Network status hook for offline sync indicators.
 *
 * Uses @react-native-community/netinfo to detect
 * online/offline state for the SyncIndicator component.
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

interface NetworkStatus {
    /** Whether the device has an active internet connection */
    isOnline: boolean;
    /** Whether we are still determining the connection state */
    isChecking: boolean;
}

/**
 * Subscribe to network connectivity changes.
 *
 * @returns Current network status (online/offline)
 */
export function useNetworkStatus(): NetworkStatus {
    const [status, setStatus] = useState<NetworkStatus>({
        isOnline: true,
        isChecking: true,
    });

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setStatus({
                isOnline: state.isConnected ?? true,
                isChecking: false,
            });
        });

        return unsubscribe;
    }, []);

    return status;
}
